"use server";

import { db } from "@/lib/db";

async function getDefaultBusiness() {
  let business = await db.business.findFirst();
  if (!business) {
    business = await db.business.create({
      data: { name: "Apex Retailers", currency: "NGN" },
    });
  }
  return business;
}

export async function getFinancialSummary() {
  const business = await getDefaultBusiness();

  const [sales, saleItems, expenses, products, customers] = await Promise.all([
    db.sale.findMany({ where: { businessId: business.id } }),
    db.saleItem.findMany({
      where: { sale: { businessId: business.id } },
    }),
    db.expense.findMany({ where: { businessId: business.id } }),
    db.product.findMany({ where: { businessId: business.id } }),
    db.customer.findMany({ where: { businessId: business.id } }),
  ]);

  // Gross Financials
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const totalCashCollected = sales.reduce((acc, sale) => acc + sale.amountPaid, 0);
  const totalCOGS = saleItems.reduce((acc, item) => acc + item.totalCostPrice, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Operating Expenses
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Net Profit
  const netProfit = grossProfit - totalExpenses;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Working Capital & Assets
  const inventoryValuation = products.reduce(
    (acc, p) => acc + p.costPrice * p.currentStock,
    0
  );
  const retailInventoryValue = products.reduce(
    (acc, p) => acc + p.sellingPrice * p.currentStock,
    0
  );
  const totalReceivables = customers.reduce((acc, c) => acc + c.totalOwed, 0);

  return {
    totalRevenue,
    totalCashCollected,
    totalCOGS,
    grossProfit,
    grossMargin,
    totalExpenses,
    netProfit,
    netMargin,
    inventoryValuation,
    retailInventoryValue,
    totalReceivables,
    salesCount: sales.length,
    recentExpenses: expenses.slice(0, 5),
  };
}