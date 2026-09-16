// src/app/actions/search.ts
"use server";

import { db } from "@/lib/db";

export type SearchResults = {
  products: { id: string; name: string; sku: string | null; sellingPrice: number; currentStock: number }[];
  customers: { id: string; name: string; phone: string; totalOwed: number }[];
  sales: { id: string; receiptNumber: string; totalAmount: number; paymentStatus: string; createdAt: Date }[];
};

export async function searchStore(query: string): Promise<SearchResults> {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 2) {
    return { products: [], customers: [], sales: [] };
  }

  const business = await db.business.findFirst();
  if (!business) return { products: [], customers: [], sales: [] };

  const [products, customers, sales] = await Promise.all([
    // Products search by name, SKU, or barcode
    db.product.findMany({
      where: {
        businessId: business.id,
        OR: [
          { name: { contains: cleanQuery, mode: "insensitive" } },
          { sku: { contains: cleanQuery, mode: "insensitive" } },
          { barcode: { contains: cleanQuery, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, sku: true, sellingPrice: true, currentStock: true },
      take: 4,
    }),

    // Customers search by name or phone
    db.customer.findMany({
      where: {
        businessId: business.id,
        OR: [
          { name: { contains: cleanQuery, mode: "insensitive" } },
          { phone: { contains: cleanQuery, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, phone: true, totalOwed: true },
      take: 4,
    }),

    // Sales search by receipt number
    db.sale.findMany({
      where: {
        businessId: business.id,
        receiptNumber: { contains: cleanQuery, mode: "insensitive" },
      },
      select: { id: true, receiptNumber: true, totalAmount: true, paymentStatus: true, createdAt: true },
      take: 4,
    }),
  ]);

  return { products, customers, sales };
}