// src/app/actions/customers.ts
"use server";

import { db } from "@/lib/db";
import { customerSchema } from "@/lib/validations/customer";
import { revalidatePath } from "next/cache";

async function getDefaultBusiness() {
  let business = await db.business.findFirst();
  if (!business) {
    business = await db.business.create({
      data: { name: "Apex Retailers", currency: "NGN" },
    });
  }
  return business;
}

export async function getCustomers() {
  const business = await getDefaultBusiness();
  return await db.customer.findMany({
    where: { businessId: business.id },
    orderBy: { totalOwed: "desc" },
  });
}

export async function createCustomer(formData: FormData) {
  const business = await getDefaultBusiness();

  const rawData = {
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || undefined,
  };

  const parsed = customerSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const customer = await db.customer.create({
      data: {
        businessId: business.id,
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
      },
    });

    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/sales");
    return { success: true, customer };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create customer";
    return { success: false, error: message };
  }
}
export async function recordDebtPayment(formData: FormData) {
  const customerId = formData.get("customerId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const paymentMethod = formData.get("paymentMethod") as "CASH" | "TRANSFER" | "POS";
  const note = (formData.get("note") as string) || null;

  if (!customerId || isNaN(amount) || amount <= 0) {
    return { success: false, error: "Invalid payment amount or customer." };
  }

  try {
    await db.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        include: {
          sales: {
            where: { balanceDue: { gt: 0 } },
            orderBy: { createdAt: "asc" }, // Settle oldest unpaid bills first (FIFO)
          },
        },
      });

      if (!customer) throw new Error("Customer not found");
      if (customer.totalOwed <= 0) throw new Error("This customer currently has no outstanding debt.");

      let remainingPayment = amount;

      // Allocate payment to unpaid sales in order
      for (const sale of customer.sales) {
        if (remainingPayment <= 0) break;

        const deduction = Math.min(sale.balanceDue, remainingPayment);
        const newBalanceDue = sale.balanceDue - deduction;
        const newAmountPaid = sale.amountPaid + deduction;
        const newStatus = newBalanceDue === 0 ? "PAID" : "PARTIAL";

        await tx.sale.update({
          where: { id: sale.id },
          data: {
            balanceDue: newBalanceDue,
            amountPaid: newAmountPaid,
            paymentStatus: newStatus,
          },
        });

        await tx.debtPayment.create({
          data: {
            saleId: sale.id,
            customerId: customer.id,
            amount: deduction,
            paymentMethod,
            note: note || `Debt payment toward receipt #${sale.receiptNumber}`,
          },
        });

        remainingPayment -= deduction;
      }

      // Deduct balance from customer profile
      const newTotalOwed = Math.max(0, customer.totalOwed - amount);
      await tx.customer.update({
        where: { id: customer.id },
        data: { totalOwed: newTotalOwed },
      });
    });

    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/sales/history");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to record payment";
    return { success: false, error: message };
  }
}