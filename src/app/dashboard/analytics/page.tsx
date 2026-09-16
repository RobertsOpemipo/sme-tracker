// src/app/dashboard/analytics/page.tsx
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Receipt,
  Wallet,
  ArrowUpRight,
  Package,
  Layers,
  Percent,
} from "lucide-react";

export const revalidate = 0; // Fresh financial numbers on load

export default async function AnalyticsPage() {
  const business = await db.business.findFirst();

  // Fetch all historical financial objects
  const [sales, expenses, products, categories] = await Promise.all([
    db.sale.findMany({
      where: { businessId: business?.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    db.expense.findMany({
      where: { businessId: business?.id },
      orderBy: { date: "desc" },
    }),
    db.product.findMany({
      where: { businessId: business?.id },
    }),
    db.category.findMany({
      where: { businessId: business?.id },
    }),
  ]);

  // 1. High-level aggregates
  const totalGrossRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalActualCashCollected = sales.reduce((acc, s) => acc + s.amountPaid, 0);
  const totalDebtorReceivables = sales.reduce((acc, s) => acc + s.balanceDue, 0);
  const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Snapshot COGS and Gross Margins from line items
  let totalCOGS = 0;
  let totalGrossProfit = 0;

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      totalCOGS += item.totalCostPrice;
      totalGrossProfit += item.grossProfit;
    });
  });

  const netOperatingProfit = totalGrossProfit - totalOperatingExpenses;
  const netMarginPercent =
    totalGrossRevenue > 0
      ? ((netOperatingProfit / totalGrossRevenue) * 100).toFixed(1)
      : "0.0";
  const grossMarginPercent =
    totalGrossRevenue > 0
      ? ((totalGrossProfit / totalGrossRevenue) * 100).toFixed(1)
      : "0.0";

  // 2. Channel Distribution (Cash vs Transfer vs POS vs Unpaid Debt)
  const channelTotals = {
    CASH: 0,
    TRANSFER: 0,
    POS: 0,
    UNPAID_DEBT: totalDebtorReceivables,
  };

  sales.forEach((s) => {
    if (s.paymentMethod === "CASH") channelTotals.CASH += s.amountPaid;
    if (s.paymentMethod === "TRANSFER") channelTotals.TRANSFER += s.amountPaid;
    if (s.paymentMethod === "POS") channelTotals.POS += s.amountPaid;
  });

  // 3. Top Performing SKUs by Gross Profit Generation
  const skuMap: Record<
    string,
    { name: string; sku: string | null; unitsSold: number; revenue: number; profit: number }
  > = {};

  sales.forEach((s) => {
    s.items.forEach((item) => {
      if (!skuMap[item.productId]) {
        skuMap[item.productId] = {
          name: item.product.name,
          sku: item.product.sku,
          unitsSold: 0,
          revenue: 0,
          profit: 0,
        };
      }
      skuMap[item.productId].unitsSold += item.quantity;
      skuMap[item.productId].revenue += item.totalRevenue;
      skuMap[item.productId].profit += item.grossProfit;
    });
  });

  const topProducts = Object.values(skuMap)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 6);

  // 4. Expenses Breakdown by Category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted bg-brand-surface px-2 py-0.5 rounded-md border border-brand-border">
              Financial Intelligence
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-ink mt-1">
            Executive Performance &amp; Margins
          </h1>
        </div>
        <p className="text-xs text-brand-muted font-mono">
          Currency: <span className="font-bold text-brand-ink">{business?.currency || "NGN"}</span> • Snapshot FIFO
        </p>
      </div>

      {/* 4 Core KPI Summary Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Turnover</span>
            <div className="w-7 h-7 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-brand-ink">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-brand-ink">
            {formatCurrency(totalGrossRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-brand-muted">
            <span className="font-mono font-bold text-brand-ink">{sales.length}</span> total orders settled
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">COGS Burn</span>
            <div className="w-7 h-7 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-brand-ink">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-brand-ink">
            {formatCurrency(totalCOGS)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-brand-muted">
            <span>Supplier direct buying cost</span>
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Operating Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-fintech-rose-light border border-fintech-rose-border flex items-center justify-center text-fintech-rose">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-fintech-rose">
            {formatCurrency(totalOperatingExpenses)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-brand-muted">
            <span>Overheads (Utilities, packaging)</span>
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Clean Profit</span>
            <div className="w-7 h-7 rounded-lg bg-fintech-mint-light border border-fintech-mint-border flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-emerald-600">
            {formatCurrency(netOperatingProfit)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
            <span>{netMarginPercent}% Net Margin</span>
            <span className="text-brand-muted font-normal">({grossMarginPercent}% Gross)</span>
          </div>
        </div>
      </div>

      {/* GRAPH ROW 1: Waterfall Cost Breakdown & Channel Inflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 cols: Margin Waterfall Progression */}
        <div className="lg:col-span-7 bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-brand-ink">Profit Margin Waterfall</h2>
              <p className="text-[11px] text-brand-muted">
                From top-line gross receipt to net operational cash retained.
              </p>
            </div>
            <Percent className="w-4 h-4 text-brand-muted" />
          </div>

          {/* Graphical Horizontal Stack Bar */}
          <div className="space-y-2 pt-2">
            <div className="h-6 w-full rounded-xl overflow-hidden flex bg-brand-surface border border-brand-border/80">
              <div
                style={{ width: `${totalGrossRevenue > 0 ? (totalCOGS / totalGrossRevenue) * 100 : 0}%` }}
                className="bg-slate-400 transition-all"
                title={`COGS: ${formatCurrency(totalCOGS)}`}
              />
              <div
                style={{
                  width: `${
                    totalGrossRevenue > 0
                      ? (totalOperatingExpenses / totalGrossRevenue) * 100
                      : 0
                  }%`,
                }}
                className="bg-fintech-rose transition-all"
                title={`Expenses: ${formatCurrency(totalOperatingExpenses)}`}
              />
              <div
                style={{
                  width: `${
                    totalGrossRevenue > 0
                      ? Math.max(0, (netOperatingProfit / totalGrossRevenue) * 100)
                      : 0
                  }%`,
                }}
                className="bg-emerald-500 transition-all"
                title={`Net Profit: ${formatCurrency(netOperatingProfit)}`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-brand-border/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
                <span className="text-brand-muted font-medium">COGS ({formatCurrency(totalCOGS)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-fintech-rose" />
                <span className="text-brand-muted font-medium">Expenses ({formatCurrency(totalOperatingExpenses)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="font-bold text-emerald-700">Net Retained ({formatCurrency(netOperatingProfit)})</span>
              </div>
            </div>
          </div>

          {/* Metric Comparison Table */}
          <div className="pt-2 divide-y divide-brand-border/60 text-xs">
            <div className="py-2 flex justify-between">
              <span className="text-brand-muted">Total Gross Invoiced</span>
              <span className="font-mono font-bold text-brand-ink">{formatCurrency(totalGrossRevenue)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-500">
              <span>Less: Product Buying Cost (COGS)</span>
              <span className="font-mono text-slate-700">- {formatCurrency(totalCOGS)}</span>
            </div>
            <div className="py-2 flex justify-between font-semibold text-brand-ink">
              <span>Gross Product Margin</span>
              <span className="font-mono">{formatCurrency(totalGrossProfit)}</span>
            </div>
            <div className="py-2 flex justify-between text-fintech-rose">
              <span>Less: Store Operating Overheads</span>
              <span className="font-mono">- {formatCurrency(totalOperatingExpenses)}</span>
            </div>
            <div className="py-2 flex justify-between font-black text-emerald-700 pt-3">
              <span>True Net Bottom-Line Profit</span>
              <span className="font-mono text-sm">{formatCurrency(netOperatingProfit)}</span>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Settlement Distribution (Cash vs Transfer vs POS vs Debt) */}
        <div className="lg:col-span-5 bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-brand-ink">Settlement Channels</h2>
              <p className="text-[11px] text-brand-muted">Distribution of collected cash vs. credit.</p>
            </div>
            <Wallet className="w-4 h-4 text-brand-muted" />
          </div>

          <div className="space-y-3 pt-2">
            {/* Cash */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-brand-ink">Physical Cash</span>
                <span className="font-mono font-bold text-brand-ink">{formatCurrency(channelTotals.CASH)}</span>
              </div>
              <div className="h-2 w-full bg-brand-surface rounded-full overflow-hidden border border-brand-border/60">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${totalGrossRevenue > 0 ? (channelTotals.CASH / totalGrossRevenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Transfer */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-brand-ink">Bank Transfer</span>
                <span className="font-mono font-bold text-brand-ink">{formatCurrency(channelTotals.TRANSFER)}</span>
              </div>
              <div className="h-2 w-full bg-brand-surface rounded-full overflow-hidden border border-brand-border/60">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{
                    width: `${totalGrossRevenue > 0 ? (channelTotals.TRANSFER / totalGrossRevenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* POS Card */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-brand-ink">POS Terminal Card</span>
                <span className="font-mono font-bold text-brand-ink">{formatCurrency(channelTotals.POS)}</span>
              </div>
              <div className="h-2 w-full bg-brand-surface rounded-full overflow-hidden border border-brand-border/60">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{
                    width: `${totalGrossRevenue > 0 ? (channelTotals.POS / totalGrossRevenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Unpaid Debt / Credit */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-fintech-rose">Open Customer Debt</span>
                <span className="font-mono font-bold text-fintech-rose">
                  {formatCurrency(channelTotals.UNPAID_DEBT)}
                </span>
              </div>
              <div className="h-2 w-full bg-fintech-rose-light rounded-full overflow-hidden border border-fintech-rose-border">
                <div
                  className="h-full bg-fintech-rose rounded-full"
                  style={{
                    width: `${
                      totalGrossRevenue > 0
                        ? (channelTotals.UNPAID_DEBT / totalGrossRevenue) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-brand-surface rounded-xl border border-brand-border text-xs flex justify-between items-center">
            <span className="text-brand-muted">Real Cash at Hand:</span>
            <span className="font-mono font-black text-brand-ink">
              {formatCurrency(totalActualCashCollected)}
            </span>
          </div>
        </div>
      </div>

      {/* GRAPH ROW 2: High-Margin SKUs vs Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 cols: Top Profit Generating Products */}
        <div className="lg:col-span-8 bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-brand-ink">Profit Leadership by Product</h2>
              <p className="text-[11px] text-brand-muted">
                Items ranked by actual gross naira margin contributed.
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-brand-muted" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-border text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  <th className="pb-2.5">Product Title</th>
                  <th className="pb-2.5 text-center">Units Sold</th>
                  <th className="pb-2.5 text-right">Gross Sales</th>
                  <th className="pb-2.5 text-right">Profit Contribution</th>
                  <th className="pb-2.5 text-right">Markup</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-brand-muted">
                      No sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => {
                    const markup = p.revenue > 0 ? ((p.profit / (p.revenue - p.profit)) * 100).toFixed(0) : "0";
                    return (
                      <tr key={idx} className="hover:bg-brand-surface/70 transition">
                        <td className="py-2.5 font-bold text-brand-ink">
                          <div className="truncate max-w-[200px]">{p.name}</div>
                          {p.sku && <span className="font-mono text-[10px] text-brand-muted block">{p.sku}</span>}
                        </td>
                        <td className="py-2.5 text-center font-mono font-semibold text-brand-ink">
                          {p.unitsSold}
                        </td>
                        <td className="py-2.5 text-right font-mono text-brand-muted">
                          {formatCurrency(p.revenue)}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(p.profit)}
                        </td>
                        <td className="py-2.5 text-right font-mono text-[11px] font-semibold text-brand-ink">
                          +{markup}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 cols: Operational Expense Drivers */}
        <div className="lg:col-span-4 bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-brand-ink">Overhead Outflows</h2>
              <p className="text-[11px] text-brand-muted">Where operational funds leak.</p>
            </div>
            <PieChart className="w-4 h-4 text-brand-muted" />
          </div>

          <div className="space-y-3 pt-2">
            {Object.keys(expenseByCategory).length === 0 ? (
              <div className="py-8 text-center text-xs text-brand-muted">
                No expense entries logged.
              </div>
            ) : (
              Object.entries(expenseByCategory).map(([cat, amount]) => {
                const pct =
                  totalOperatingExpenses > 0
                    ? ((amount / totalOperatingExpenses) * 100).toFixed(0)
                    : "0";
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-brand-ink">{cat}</span>
                      <span className="font-mono font-bold text-brand-ink">
                        {formatCurrency(amount)}{" "}
                        <span className="text-[10px] text-brand-muted font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-brand-surface rounded-full overflow-hidden border border-brand-border/60">
                      <div
                        className="h-full bg-slate-800 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}