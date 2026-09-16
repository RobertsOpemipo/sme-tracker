import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  costPrice: z.number().nonnegative("Cost price cannot be negative"),
  sellingPrice: z.number().positive("Selling price must be greater than zero"),
  currentStock: z.number().int().nonnegative().default(0),
  minStockAlert: z.number().int().nonnegative().default(5),
});

export type ProductInput = z.infer<typeof productSchema>;