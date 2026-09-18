// src/app/actions/inventory.ts
"use server";

import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations/product";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function getOrCreateDefaultBusiness() {
  let business = await db.business.findFirst();
  if (!business) {
    business = await db.business.create({
      data: {
        name: "Apex Retailers",
        currency: "NGN",
      },
    });
  }
  return business;
}

async function getActiveBusinessId() {
  const business = await db.business.findFirst();
  if (business) return business.id;

  const created = await db.business.create({
    data: {
      name: "Apex Supermart & Provisions",
      currency: "NGN",
    },
  });
  return created.id;
}

export async function getCategories() {
  const businessId = await getActiveBusinessId();
  return await db.category.findMany({
    where: { businessId },
    orderBy: { name: "asc" },
  });
}

export async function getInventoryProducts() {
  const businessId = await getActiveBusinessId();
  return await db.product.findMany({
    where: { businessId },
    include: { categoryRel: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProduct(formData: FormData) {
  try {
    const businessId = await getActiveBusinessId();

    const categoryId = (formData.get("categoryId") as string) || null;
    const categoryName = (formData.get("category") as string) || null;

    const rawData = {
      name: formData.get("name") as string,
      sku: (formData.get("sku") as string) || null,
      category: categoryName,
      costPrice: parseFloat(formData.get("costPrice") as string),
      sellingPrice: parseFloat(formData.get("sellingPrice") as string),
      currentStock: parseInt(formData.get("currentStock") as string, 10) || 0,
      minStockAlert: parseInt(formData.get("minStockAlert") as string, 10) || 5,
    };

    const parsed = productSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const product = await tx.product.create({
        data: {
          businessId,
          categoryId,
          ...parsed.data,
        },
      });

      if (parsed.data.currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: parsed.data.currentStock,
            reason: "RESTOCK",
            note: "Initial stock intake on creation",
          },
        });
      }
    });

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/analytics");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return { success: false, error: message };
  }
}
export async function updateProduct(productId: string, formData: FormData) {
  const business = await getOrCreateDefaultBusiness();

  const categoryId = (formData.get("categoryId") as string) || null;
  const categoryName = (formData.get("category") as string) || null;

  const rawData = {
    name: formData.get("name") as string,
    sku: (formData.get("sku") as string) || null,
    category: categoryName,
    costPrice: parseFloat(formData.get("costPrice") as string),
    sellingPrice: parseFloat(formData.get("sellingPrice") as string),
    currentStock: parseInt(formData.get("currentStock") as string, 10) || 0,
    minStockAlert: parseInt(formData.get("minStockAlert") as string, 10) || 5,
  };

  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const existing = await db.product.findUnique({
      where: { id: productId },
    });

    if (!existing || existing.businessId !== business.id) {
      return { success: false, error: "Product not found" };
    }

    const stockDiff = parsed.data.currentStock - existing.currentStock;

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          categoryId,
          ...parsed.data,
        },
      });

      // Log stock movement if stock count was adjusted directly
      if (stockDiff !== 0) {
        await tx.stockMovement.create({
          data: {
            productId,
            quantity: stockDiff,
            reason: "MANUAL_CORRECTION",
            note: "Stock adjusted via product edit",
          },
        });
      }
    });

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    return { success: false, error: message };
  }
}

export async function deleteProduct(productId: string) {
  const business = await getOrCreateDefaultBusiness();

  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: { saleItems: true },
        },
      },
    });

    if (!product || product.businessId !== business.id) {
      return { success: false, error: "Product not found" };
    }

    // Preserve historical financial audit trail
    if (product._count.saleItems > 0) {
      return {
        success: false,
        error: `Cannot delete "${product.name}" because it is linked to past sales receipts. Set stock to 0 instead.`,
      };
    }

    await db.product.delete({
      where: { id: productId },
    });

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    return { success: false, error: message };
  }
}