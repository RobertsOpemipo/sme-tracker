// src/app/actions/pos.ts
"use server";

import { db } from "@/lib/db";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type CartItem = {
  productId: string;
  name: string;
  sku: string | null;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  maxStock: number;
};

export type CheckoutPayload = {
  items: CartItem[];
  customerId?: string | null;
  subtotal: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  notes?: string;
};

export async function processSale(payload: CheckoutPayload) {
  if (!payload.items || payload.items.length === 0) {
    return { success: false, error: "Cart is empty." };
  }

  const business = await db.business.findFirst();
  if (!business) {
    return { success: false, error: "Business account not found." };
  }

  const balanceDue = Math.max(0, payload.totalAmount - payload.amountPaid);
  let paymentStatus: PaymentStatus = PaymentStatus.PAID;

  if (balanceDue > 0) {
    if (!payload.customerId) {
      return {
        success: false,
        error: "A customer must be attached to record credit or partial payments.",
      };
    }
    paymentStatus = payload.amountPaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID;
  }

  // Generate clean sequential receipt identifier: REC-YYYYMMDD-XXXX
  const timestamp = new Date();
  const dateSegment = timestamp.toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const receiptNumber = `REC-${dateSegment}-${randomSuffix}`;

  try {
    const sale = await db.$transaction(async (tx) => {
      // 1. Re-verify stock levels inside the transaction lock
      for (const item of payload.items) {
        const prod = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!prod || prod.currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.name}". Available: ${prod?.currentStock ?? 0}`
          );
        }

        // Deduct inventory
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { decrement: item.quantity },
          },
        });

        // Audit inventory decrement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: -item.quantity,
            reason: "SALE",
            note: `Sold via receipt #${receiptNumber}`,
          },
        });
      }

      // 2. Create the Sale record
      const createdSale = await tx.sale.create({
        data: {
          businessId: business.id,
          customerId: payload.customerId || null,
          receiptNumber,
          subtotal: payload.subtotal,
          discount: payload.discount,
          totalAmount: payload.totalAmount,
          amountPaid: payload.amountPaid,
          balanceDue,
          paymentMethod: payload.paymentMethod,
          paymentStatus,
          notes: payload.notes || null,
          // Snapshot line items with COGS to lock margins forever
          items: {
            create: payload.items.map((item) => {
              const totalCostPrice = item.costPrice * item.quantity;
              const totalRevenue = item.sellingPrice * item.quantity;
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitCostPrice: item.costPrice,
                unitSellingPrice: item.sellingPrice,
                totalCostPrice,
                totalRevenue,
                grossProfit: totalRevenue - totalCostPrice,
              };
            }),
          },
        },
      });

      // 3. Update customer outstanding debt if balance remains
      if (balanceDue > 0 && payload.customerId) {
        await tx.customer.update({
          where: { id: payload.customerId },
          data: {
            totalOwed: { increment: balanceDue },
          },
        });
      }

      return createdSale;
    });

    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/analytics");
    revalidatePath("/dashboard");

    return { success: true, receiptNumber: sale.receiptNumber, saleId: sale.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to finalize checkout";
    return { success: false, error: message };
  }
}