// src/app/dashboard/analytics/page.tsx
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  CreditCard,
  Banknote,
  Smartphone,
  BadgePercent,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Calendar,
  Wallet,
} from "lucide-react";

export const revalidate = 0;

interface ProductStat {
  id: string;
  name: string;
  sku: string | null;
  unitsSold: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const selectedYear = parseInt(params.year || now.getFullYear().toString(), 10);
  const selectedMonth = parseInt(params.month || (now.getMonth() + 1).toString(), 10);

  // Month date boundary
  const startDate = new Date(selectedYear, selectedMonth - 1, 1);
  const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

  const business = await db.business.findFirst();

  // Query Sales & Expenses strictly within the active month window
  const [monthSales, monthExpenses, allProducts] = await Promise.all([
    db.sale.findMany({
      where: {
        businessId: business?.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    }),
    db.expense.findMany({
      where: {
        businessId: business?.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    db.product.findMany({
      where: { businessId: business?.id },
    }),
  ]);

  // ----------------------------------------------------------------
  // 1. High-Level Aggregates
  // ----------------------------------------------------------------
  const grossTurnover = monthSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const cashCollected = monthSales.reduce((acc, s) => acc + s.amountPaid, 0);
  const uncollectedCredit = monthSales.reduce((acc, s) => acc + s.balanceDue, 0);
  const totalOperatingCosts = monthExpenses.reduce((acc, e) => acc + e.amount, 0);

  let totalCOGS = 0;
  let totalGrossProfit = 0;

  // ----------------------------------------------------------------
  // 2. Product-Level Profitability & Revenue Aggregation
  // ----------------------------------------------------------------
  const productPerformanceMap: Record<string, ProductStat> = {};

  // Initialize with zero stats for catalog coverage
  allProducts.forEach((p) => {
    productPerformanceMap[p.id] = {
      id: p.id,
      name: p.name,
      sku: p.sku,
      unitsSold: 0,
      totalRevenue: 0,
      totalCost: 0,
      grossProfit: 0,
      marginPercent: 0,
    };
  });

  monthSales.forEach((sale) => {
    sale.items.forEach((item) => {
      totalCOGS += item.totalCostPrice;
      totalGrossProfit += item.grossProfit;

      const current = productPerformanceMap[item.productId];
      if (current) {
        current.unitsSold += item.quantity;
        current.totalRevenue += item.totalRevenue;
        current.totalCost += item.totalCostPrice;
        current.grossProfit += item.grossProfit;
      }
    });
  });

  // Calculate gross margin % per item
  const productStatsList = Object.values(productPerformanceMap).map((p) => ({
    ...p,
    marginPercent: p.totalRevenue > 0 ? (p.grossProfit / p.totalRevenue) * 100 : 0,
  }));

  // Filter items that had activity this month
  const activeProducts = productStatsList.filter((p) => p.unitsSold > 0);

  // Extremes: Profit
  const sortedByProfit = [...activeProducts].sort((a, b) => b.grossProfit - a.grossProfit);
  const topProfitProduct = sortedByProfit[0] || null;
  const lowestProfitProduct = sortedByProfit[sortedByProfit.length - 1] || null;

  // Extremes: Revenue
  const sortedByRevenue = [...activeProducts].sort((a, b) => b.totalRevenue - a.totalRevenue);
  const topRevenueProduct = sortedByRevenue[0] || null;
  const lowestRevenueProduct = sortedByRevenue[sortedByRevenue.length - 1] || null;

  // True Net Profit
  const netCleanProfit = totalGrossProfit - totalOperatingCosts;
  const netMarginPct = grossTurnover > 0 ? ((netCleanProfit / grossTurnover) * 100).toFixed(1) : "0.0";

  // ----------------------------------------------------------------
  // 3. Payment Method Dominance Breakdown
  // ----------------------------------------------------------------
  const methodMap = {
    CASH: { count: 0, total: 0, label: "Cash Tender", icon: Banknote },
    TRANSFER: { count: 0, total: 0, label: "Bank Transfer", icon: Smartphone },
    POS: { count: 0, total: 0, label: "POS Terminal", icon: CreditCard },
    CREDIT: { count: 0, total: 0, label: "Debt / Credit Note", icon: Wallet },
  };

  monthSales.forEach((sale) => {
    if (sale.paymentMethod in methodMap) {
      methodMap[sale.paymentMethod].count += 1;
      methodMap[sale.paymentMethod].total += sale.amountPaid;
    }
    // If sale had remaining credit balance
    if (sale.balanceDue > 0) {
      methodMap.CREDIT.total += sale.balanceDue;
    }
  });

  const paymentBreakdown = Object.entries(methodMap)
    .map(([key, data]) => ({
      key,
      ...data,
      share: grossTurnover > 0 ? (data.total / grossTurnover) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const dominantMethod = paymentBreakdown[0];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ----------------- Header & Month Filter ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fintech-mint" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
              Monthly Audit &amp; Leadership
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-ink mt-0.5">
            {monthNames[selectedMonth - 1]} {selectedYear} Insights
          </h1>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <form className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <select
                name="month"
                defaultValue={selectedMonth}
                className="pl-8 pr-3 py-1.5 text-xs font-bold bg-white border border-brand-border rounded-xl text-brand-ink focus:outline-none"
              >
                {monthNames.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <select
              name="year"
              defaultValue={selectedYear}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-brand-border rounded-xl text-brand-ink focus:outline-none"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 bg-brand-ink text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Filter
            </button>
          </form>
        </div>
      </div>

      {/* ----------------- Top 4 Extremes Cards ----------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highest Profit */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-fintech-mint-light border border-fintech-mint-border px-2 py-0.5 rounded-md">
              Top Profit Contributor
            </span>
            <Award className="w-4 h-4 text-fintech-mint" />
          </div>
          {topProfitProduct ? (
            <div className="mt-3 space-y-1">
              <div className="text-sm font-bold text-brand-ink truncate" title={topProfitProduct.name}>
                {topProfitProduct.name}
              </div>
              <div className="text-xl font-black font-mono text-emerald-700">
                +{formatCurrency(topProfitProduct.grossProfit)}
              </div>
              <div className="text-[11px] text-brand-muted flex items-center gap-1">
                <span>{topProfitProduct.unitsSold} units sold</span> •{" "}
                <span className="font-bold text-brand-ink">{topProfitProduct.marginPercent.toFixed(0)}% margin</span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-xs text-brand-muted">No sales logged for this month</div>
          )}
        </div>

        {/* Lowest / Least Profit */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-fintech-amber-light border border-fintech-amber-border px-2 py-0.5 rounded-md">
              Lowest Profit Margin
            </span>
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          {lowestProfitProduct ? (
            <div className="mt-3 space-y-1">
              <div className="text-sm font-bold text-brand-ink truncate" title={lowestProfitProduct.name}>
                {lowestProfitProduct.name}
              </div>
              <div className="text-xl font-black font-mono text-slate-800">
                +{formatCurrency(lowestProfitProduct.grossProfit)}
              </div>
              <div className="text-[11px] text-brand-muted flex items-center gap-1">
                <span>{lowestProfitProduct.unitsSold} units sold</span> •{" "}
                <span className="font-bold text-amber-700">{lowestProfitProduct.marginPercent.toFixed(0)}% margin</span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-xs text-brand-muted">No sales logged for this month</div>
          )}
        </div>

        {/* Highest Revenue */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
              Top Turnover Driver
            </span>
            <ArrowUpRight className="w-4 h-4 text-sky-600" />
          </div>
          {topRevenueProduct ? (
            <div className="mt-3 space-y-1">
              <div className="text-sm font-bold text-brand-ink truncate" title={topRevenueProduct.name}>
                {topRevenueProduct.name}
              </div>
              <div className="text-xl font-black font-mono text-brand-ink">
                {formatCurrency(topRevenueProduct.totalRevenue)}
              </div>
              <div className="text-[11px] text-brand-muted">
                Contributed <span className="font-bold text-brand-ink">{topRevenueProduct.unitsSold} volume units</span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-xs text-brand-muted">No sales logged for this month</div>
          )}
        </div>

        {/* Lowest Revenue */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-fintech-rose-light border border-fintech-rose-border px-2 py-0.5 rounded-md">
              Slowest Revenue SKU
            </span>
            <ArrowDownRight className="w-4 h-4 text-fintech-rose" />
          </div>
          {lowestRevenueProduct ? (
            <div className="mt-3 space-y-1">
              <div className="text-sm font-bold text-brand-ink truncate" title={lowestRevenueProduct.name}>
                {lowestRevenueProduct.name}
              </div>
              <div className="text-xl font-black font-mono text-slate-700">
                {formatCurrency(lowestRevenueProduct.totalRevenue)}
              </div>
              <div className="text-[11px] text-brand-muted">
                Only {lowestRevenueProduct.unitsSold} units rung up
              </div>
            </div>
          ) : (
            <div className="py-6 text-xs text-brand-muted">No sales logged for this month</div>
          )}
        </div>
      </div>

      {/* ----------------- Payment Methods & Cash Dominance ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Payment Channels Ranking */}
        <div className="lg:col-span-6 bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-brand-ink">Payment Channel Ranking</h2>
              <p className="text-[11px] text-brand-muted">Which payment method customers use the most.</p>
            </div>
            {dominantMethod && (
              <span className="text-[10px] font-bold text-emerald-800 bg-fintech-mint-light border border-fintech-mint-border px-2 py-0.5 rounded-md">
                Top: {dominantMethod.label}
              </span>
            )}
          </div>

          <div className="space-y-3 pt-1">
            {paymentBreakdown.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="space-y-1.5 p-3 rounded-xl bg-brand-surface border border-brand-border/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white border border-brand-border flex items-center justify-center text-brand-ink">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-brand-ink">{item.label}</span>
                      {item.count > 0 && (
                        <span className="text-[10px] text-brand-muted font-mono">({item.count} orders)</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-xs text-brand-ink block">
                        {formatCurrency(item.total)}
                      </span>
                      <span className="text-[10px] text-brand-muted font-mono">{item.share.toFixed(1)}% of sales</span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.key === "CASH"
                          ? "bg-emerald-500"
                          : item.key === "TRANSFER"
                          ? "bg-sky-500"
                          : item.key === "POS"
                          ? "bg-indigo-500"
                          : "bg-fintech-rose"
                      }`}
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Realized Cash vs. True Net Profit */}
        <div className="lg:col-span-6 bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-brand-ink">True Net Profitability</h2>
                <p className="text-[11px] text-brand-muted">Gross Margin less Operating Overheads.</p>
              </div>
              <BadgePercent className="w-4 h-4 text-brand-muted" />
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-brand-surface border border-brand-border space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-muted">Total Gross Inflow:</span>
                <span className="font-mono font-bold text-brand-ink">{formatCurrency(grossTurnover)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Inventory Cost (COGS):</span>
                <span className="font-mono text-slate-700">- {formatCurrency(totalCOGS)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-brand-ink pt-1 border-t border-brand-border/60">
                <span>Realized Gross Profit:</span>
                <span className="font-mono">{formatCurrency(totalGrossProfit)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-fintech-rose">
                <span>Operating Expenses (Overheads):</span>
                <span className="font-mono">- {formatCurrency(totalOperatingCosts)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-brand-border">
                <div>
                  <span className="text-xs font-bold text-brand-ink block">Clean Net Profit</span>
                  <span className="text-[10px] text-emerald-700 font-bold">{netMarginPct}% Net Margin</span>
                </div>
                <span className="text-xl font-black font-mono text-emerald-600">
                  {formatCurrency(netCleanProfit)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-fintech-amber-light border border-fintech-amber-border rounded-xl text-xs flex items-center justify-between">
            <span className="text-amber-950">Outstanding Debts this month:</span>
            <span className="font-mono font-black text-fintech-rose">{formatCurrency(uncollectedCredit)}</span>
          </div>
        </div>
      </div>

      {/* ----------------- Complete Product Profitability Table ----------------- */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-brand-ink">Product Margin &amp; Turnover Audit</h2>
            <p className="text-[11px] text-brand-muted">Complete breakdown of every item rung up in this period.</p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-muted">{activeProducts.length} Active SKUs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                <th className="pb-2.5">Item Name</th>
                <th className="pb-2.5 text-center">Volume</th>
                <th className="pb-2.5 text-right">Revenue</th>
                <th className="pb-2.5 text-right">COGS Burn</th>
                <th className="pb-2.5 text-right">Gross Profit</th>
                <th className="pb-2.5 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {activeProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-muted">
                    No product activity found for the selected month.
                  </td>
                </tr>
              ) : (
                sortedByProfit.map((prod) => (
                  <tr key={prod.id} className="hover:bg-brand-surface/70 transition">
                    <td className="py-2.5 font-bold text-brand-ink">
                      <div className="truncate max-w-[220px]">{prod.name}</div>
                      {prod.sku && <span className="font-mono text-[10px] text-brand-muted block">{prod.sku}</span>}
                    </td>
                    <td className="py-2.5 text-center font-mono font-semibold text-brand-ink">
                      {prod.unitsSold}
                    </td>
                    <td className="py-2.5 text-right font-mono text-brand-muted">
                      {formatCurrency(prod.totalRevenue)}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-500">
                      {formatCurrency(prod.totalCost)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(prod.grossProfit)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-brand-ink">
                      {prod.marginPercent.toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}