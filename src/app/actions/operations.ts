// src/app/actions/operations.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PaymentMethod, StockAdjustmentReason } from "@prisma/client";

// ----------------------------------------------------
// 1. DEBT SETTLEMENT
// ----------------------------------------------------
export interface SettleDebtPayload {
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  note?: string;
}

export async function settleCustomerDebt(payload: SettleDebtPayload) {
  try {
    const { customerId, amount, paymentMethod, note } = payload;
    if (amount <= 0) return { success: false, error: "Payment amount must be greater than zero." };

    const customer = await db.customer.findUnique({
      where: { id: customerId },
      include: {
        sales: {
          where: { balanceDue: { gt: 0 } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!customer) return { success: false, error: "Customer not found." };
    if (customer.totalOwed <= 0) return { success: false, error: "Customer has no outstanding debt." };

    const paymentAmount = Math.min(amount, customer.totalOwed);

    await db.$transaction(async (tx) => {
      let remainingPayment = paymentAmount;

      for (const sale of customer.sales) {
        if (remainingPayment <= 0) break;

        const deduction = Math.min(remainingPayment, sale.balanceDue);
        const nextBalanceDue = sale.balanceDue - deduction;
        const nextAmountPaid = sale.amountPaid + deduction;
        const nextStatus = nextBalanceDue <= 0 ? "PAID" : "PARTIAL";

        await tx.sale.update({
          where: { id: sale.id },
          data: {
            balanceDue: nextBalanceDue,
            amountPaid: nextAmountPaid,
            paymentStatus: nextStatus,
          },
        });

        await tx.debtPayment.create({
          data: {
            saleId: sale.id,
            customerId: customer.id,
            amount: deduction,
            paymentMethod,
            note: note || "Debt settlement received",
          },
        });

        remainingPayment -= deduction;
      }

      await tx.customer.update({
        where: { id: customerId },
        data: {
          totalOwed: Math.max(0, customer.totalOwed - paymentAmount),
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/customers/${customerId}`);
    revalidatePath("/dashboard/analytics");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to settle debt.",
    };
  }
}

// ----------------------------------------------------
// 2. INVENTORY RESTOCK (Weighted Average COGS)
// ----------------------------------------------------
export interface RestockItemPayload {
  productId: string;
  quantityAdded: number;
  newBuyingCost: number; // Supplier price per unit for this batch
  newSellingPrice?: number;
  supplierNote?: string;
}

export async function processRestock(payload: RestockItemPayload) {
  try {
    const { productId, quantityAdded, newBuyingCost, newSellingPrice, supplierNote } = payload;
    if (quantityAdded <= 0) return { success: false, error: "Restock quantity must be positive." };
    if (newBuyingCost <= 0) return { success: false, error: "Unit cost must be positive." };

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return { success: false, error: "Product not found." };

    // Weighted Average COGS Calculation:
    // (Existing Units * Existing Cost + New Units * New Cost) / Total Units
    const currentStock = Math.max(0, product.currentStock);
    const totalUnits = currentStock + quantityAdded;
    const weightedAvgCost =
      totalUnits > 0
        ? (currentStock * product.costPrice + quantityAdded * newBuyingCost) / totalUnits
        : newBuyingCost;

    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: totalUnits,
          costPrice: Math.round(weightedAvgCost * 100) / 100,
          ...(newSellingPrice && newSellingPrice > 0 ? { sellingPrice: newSellingPrice } : {}),
        },
      });

      await tx.stockMovement.create({
        data: {
          productId,
          quantity: quantityAdded,
          reason: StockAdjustmentReason.RESTOCK,
          note: supplierNote
            ? `${supplierNote} | Buying rate: ₦${newBuyingCost}`
            : `Intake of ${quantityAdded} units @ ₦${newBuyingCost}/unit`,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/sales");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Restock failed.",
    };
  }
}

// ----------------------------------------------------
// 3. DAILY CASHIER RECONCILIATION (Z-Report)
// ----------------------------------------------------
// src/app/actions/operations.ts

export async function getDailyShiftTotals(businessId: string, dateStr?: string) {
  const baseDate = dateStr ? new Date(dateStr) : new Date();

  // Create two distinct Date objects to avoid in-place mutation bugs
  const dayStart = new Date(baseDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(baseDate);
  dayEnd.setHours(23, 59, 59, 999);

  const [sales, debtPayments] = await Promise.all([
    db.sale.findMany({
      where: {
        businessId,
        createdAt: { gte: dayStart, lte: dayEnd },
      },
    }),
    db.debtPayment.findMany({
      where: {
        paidAt: { gte: dayStart, lte: dayEnd },
      },
    }),
  ]);

  let expectedCash = 0;
  let expectedTransfer = 0;
  let expectedPos = 0;
  let totalCreditGiven = 0;

  sales.forEach((s) => {
    if (s.paymentMethod === "CASH") expectedCash += s.amountPaid;
    if (s.paymentMethod === "TRANSFER") expectedTransfer += s.amountPaid;
    if (s.paymentMethod === "POS") expectedPos += s.amountPaid;
    totalCreditGiven += s.balanceDue;
  });

  debtPayments.forEach((p) => {
    if (p.paymentMethod === "CASH") expectedCash += p.amount;
    if (p.paymentMethod === "TRANSFER") expectedTransfer += p.amount;
    if (p.paymentMethod === "POS") expectedPos += p.amount;
  });

  return {
    salesCount: sales.length,
    debtPaymentsCount: debtPayments.length,
    expectedCash,
    expectedTransfer,
    expectedPos,
    totalCreditGiven,
    totalExpectedDrawerCash: expectedCash,
  };
}
export async function createCustomer(payload: {
  businessId: string;
  name: string;
  phone: string;
  email?: string;
}) {
  try {
    const { businessId, name, phone, email } = payload;
    if (!name.trim() || !phone.trim()) {
      return { success: false, error: "Name and phone number are required." };
    }

    await db.customer.create({
      data: {
        businessId,
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        totalOwed: 0,
      },
    });

    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/sales");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create customer.",
    };
  }
}