import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;