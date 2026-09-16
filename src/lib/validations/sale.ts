import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unitCostPrice: z.number().nonnegative(),
  unitSellingPrice: z.number().nonnegative(),
});

export const createSaleSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  items: z.array(saleItemSchema).min(1, "A sale must include at least one item"),
  discount: z.number().nonnegative().default(0),
  amountPaid: z.number().nonnegative().default(0),
  paymentMethod: z.enum(["CASH", "TRANSFER", "POS", "CREDIT"]),
  notes: z.string().optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;