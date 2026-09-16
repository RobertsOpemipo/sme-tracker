// src/app/actions/sales.ts
"use server";

import { db } from "@/lib/db";
import { createSaleSchema } from "@/lib/validations/sale";
import { resolvePaymentStatus } from "@/lib/calculations";
import { Prisma } from "@prisma/client";
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

export async function getSalesHistory() {
  const business = await getDefaultBusiness();
  return await db.sale.findMany({
    where: { businessId: business.id },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function recordSale(payload: unknown) {
  const business = await getDefaultBusiness();
  const parsed = createSaleSchema.safeParse(payload);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { customerId, items, discount, amountPaid, paymentMethod, notes } = parsed.data;

  try {
    const saleResult = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Fetch current product records to verify stock and lock in COGS
      const productIds = items.map((i) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      // Check stock sufficiency
      for (const item of items) {
        const prod = productMap.get(item.productId);
        if (!prod) throw new Error(`Product ${item.productId} not found`);
        if (prod.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.currentStock}, Requested: ${item.quantity}`);
        }
      }

      // 2. Compute financial sums
      let subtotal = 0;
      const saleItemInserts = items.map((item) => {
        const prod = productMap.get(item.productId)!;
        const totalRevenue = item.unitSellingPrice * item.quantity;
        const totalCostPrice = prod.costPrice * item.quantity;
        const grossProfit = totalRevenue - totalCostPrice;

        subtotal += totalRevenue;

        return {
          productId: prod.id,
          quantity: item.quantity,
          unitCostPrice: prod.costPrice,
          unitSellingPrice: item.unitSellingPrice,
          totalCostPrice,
          totalRevenue,
          grossProfit,
        };
      });

      const totalAmount = Math.max(0, subtotal - discount);
      const balanceDue = Math.max(0, totalAmount - amountPaid);
      const paymentStatus = resolvePaymentStatus(totalAmount, amountPaid);

      // If debt exists without a customer assigned, fail fast
      if (balanceDue > 0 && !customerId) {
        throw new Error("A customer must be selected or created if the bill has an unpaid balance.");
      }

      // 3. Generate receipt identifier
      const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;

      // 4. Create Sale
      const sale = await tx.sale.create({
        data: {
          businessId: business.id,
          customerId: customerId || null,
          receiptNumber,
          subtotal,
          discount,
          totalAmount,
          amountPaid,
          balanceDue,
          paymentMethod,
          paymentStatus,
          notes,
          items: {
            create: saleItemInserts,
          },
        },
      });

      // 5. Deduct inventory & record audit logs
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: -item.quantity,
            reason: "SALE",
            note: `Sold via receipt #${receiptNumber}`,
          },
        });
      }

      // 6. Update Customer balance if there is an unpaid balance
      if (customerId && balanceDue > 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: { totalOwed: { increment: balanceDue } },
        });
      }

      return sale;
    });

    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");

    return { success: true, saleId: saleResult.id, receiptNumber: saleResult.receiptNumber };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process sale";
    return { success: false, error: message };
  }
}