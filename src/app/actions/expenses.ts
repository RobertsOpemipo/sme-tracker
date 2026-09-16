"use server";

import { db } from "@/lib/db";
import { ExpenseCategory } from "@prisma/client";
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

export async function getExpenses() {
  const business = await getDefaultBusiness();
  return await db.expense.findMany({
    where: { businessId: business.id },
    orderBy: { date: "desc" },
  });
}

export async function createExpense(formData: FormData) {
  const business = await getDefaultBusiness();

  const title = (formData.get("title") as string) || "";
  const amount = parseFloat(formData.get("amount") as string);
  const category = (formData.get("category") as ExpenseCategory) || ExpenseCategory.MISCELLANEOUS;
  const note = (formData.get("note") as string) || null;

  if (!title.trim() || isNaN(amount) || amount <= 0) {
    return { success: false, error: "Please enter a valid title and expense amount." };
  }

  try {
    await db.expense.create({
      data: {
        businessId: business.id,
        title: title.trim(),
        amount,
        category,
        note,
      },
    });

    revalidatePath("/dashboard/analytics");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to record expense";
    return { success: false, error: message };
  }
}