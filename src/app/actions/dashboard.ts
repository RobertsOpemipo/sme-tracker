// src/app/actions/dashboard.ts
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

export async function getDashboardOverview() {
  const business = await getDefaultBusiness();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    todaySales,
    allSales,
    allSaleItems,
    allExpenses,
    lowStockProducts,
    recentSales,
    debtors,
    totalProductsCount,
  ] = await Promise.all([
    db.sale.findMany({
      where: {
        businessId: business.id,
        createdAt: { gte: todayStart },
      },
    }),
    db.sale.findMany({ where: { businessId: business.id } }),
    db.saleItem.findMany({ where: { sale: { businessId: business.id } } }),
    db.expense.findMany({ where: { businessId: business.id } }),
    db.product.findMany({
      where: {
        businessId: business.id,
        currentStock: { lte: db.product.fields.minStockAlert },
      },
      take: 4,
      orderBy: { currentStock: "asc" },
    }),
    db.sale.findMany({
      where: { businessId: business.id },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: true },
    }),
    db.customer.findMany({
      where: { businessId: business.id, totalOwed: { gt: 0 } },
      take: 4,
      orderBy: { totalOwed: "desc" },
    }),
    db.product.count({ where: { businessId: business.id } }),
  ]);

  const todayRevenue = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalRevenue = allSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalCashCollected = allSales.reduce((acc, s) => acc + s.amountPaid, 0);
  const totalCOGS = allSaleItems.reduce((acc, item) => acc + item.totalCostPrice, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = allExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;
  const totalDebtReceivable = debtors.reduce((acc, d) => acc + d.totalOwed, 0);

  const cashCollectionRate = totalRevenue > 0 ? (totalCashCollected / totalRevenue) * 100 : 100;
  const netMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    businessName: business.name,
    currency: business.currency,
    todayRevenue,
    todaySalesCount: todaySales.length,
    totalRevenue,
    netProfit,
    netMarginPct,
    cashCollectionRate,
    totalDebtReceivable,
    lowStockProducts,
    recentSales,
    debtors,
    totalProductsCount,
  };
}