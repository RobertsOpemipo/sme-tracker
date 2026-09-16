// src/app/dashboard/page.tsx
import { getDashboardOverview } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  Plus,
  ArrowRight,
  CircleDot,
  Wallet,
  Coins,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default async function DashboardPage() {
  const data = await getDashboardOverview();

  const formattedDate = new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner & Control Deck */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Terminal
            </span>
            <span className="text-xs text-slate-400 font-medium">{formattedDate}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 mt-1.5">
            {data.businessName} Operations
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/inventory"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300/80 hover:bg-slate-50 text-slate-700 shadow-2xs transition active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Add Item
          </Link>
          <Link
            href="/dashboard/sales"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-950 text-white hover:bg-slate-800 shadow-xs transition active:scale-[0.98]"
          >
            <span>Launch POS Register</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales Card */}
        <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Today&apos;s Inflow
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-slate-950">
              {formatCurrency(data.todayRevenue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-900">{data.todaySalesCount} orders</span>
              <span>completed today</span>
            </div>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Clean Net Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-slate-950">
              {formatCurrency(data.netProfit)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-700 font-semibold">
              <span>{data.netMarginPct.toFixed(1)}% margin</span>
              <span className="text-slate-400 font-normal">• post-expense</span>
            </div>
          </div>
        </div>

        {/* Receivables / Debt Exposure Card */}
        <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Debtor Exposure
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-rose-600">
              {formatCurrency(data.totalDebtReceivable)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-900">{data.debtors.length} customers</span>
              <span>with overdue credit</span>
            </div>
          </div>
        </div>

        {/* Working Inventory Health Card */}
        <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Stock Warnings
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                data.lowStockProducts.length > 0
                  ? "bg-amber-50 text-amber-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-slate-950">
              {data.lowStockProducts.length}{" "}
              <span className="text-sm font-normal text-slate-400">
                / {data.totalProductsCount} items
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-amber-700">
              {data.lowStockProducts.length > 0 ? "Requires restock replenishment" : "All buffers healthy"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Transaction Audit Stream */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">Recent Sales Stream</h3>
                <p className="text-xs text-slate-400 mt-0.5">Live register activity and settlements</p>
              </div>
              <Link
                href="/dashboard/sales/history"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-950 transition"
              >
                Full History <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Receipt</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-center">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                        <Receipt className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                        No sales recorded today. Launch the POS to take an order.
                      </td>
                    </tr>
                  ) : (
                    data.recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                          {sale.receiptNumber}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">
                          {sale.customer ? (
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-[10px] text-slate-700 flex items-center justify-center">
                                {sale.customer.name.charAt(0)}
                              </span>
                              <span>{sale.customer.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Walk-in Customer</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-md text-[10px]">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(sale.totalAmount)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              sale.paymentStatus === "PAID"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : sale.paymentStatus === "PARTIAL"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            <CircleDot className="w-2.5 h-2.5 fill-current" />
                            {sale.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Cash Collection Liquidity: {data.cashCollectionRate.toFixed(1)}%
            </span>
            <Link
              href="/dashboard/analytics"
              className="font-bold text-slate-900 hover:underline inline-flex items-center gap-1"
            >
              Analyze P&amp;L <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right 4 Cols: Operational Watchlists */}
        <div className="lg:col-span-4 space-y-6">
          {/* Low Stock Replenishment Watch */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Restock Watchlist</h3>
                <p className="text-[11px] text-slate-400">Items nearing replenishment threshold</p>
              </div>
              <Link
                href="/dashboard/inventory"
                className="text-xs font-bold text-slate-700 hover:text-slate-950"
              >
                Manage
              </Link>
            </div>

            {data.lowStockProducts.length === 0 ? (
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">All store inventory levels are well-stocked.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {data.lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Cost: {formatCurrency(p.costPrice)}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] shrink-0 ${
                        p.currentStock <= 0
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-amber-100/80 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {p.currentStock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Debtor Recovery Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Top Outstanding Debt</h3>
                <p className="text-[11px] text-slate-400">Customers with open credit balances</p>
              </div>
              <Link
                href="/dashboard/customers"
                className="text-xs font-bold text-slate-700 hover:text-slate-950"
              >
                Ledger
              </Link>
            </div>

            {data.debtors.length === 0 ? (
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Zero customer credit balances pending.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {data.debtors.map((debtor) => (
                  <div
                    key={debtor.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{debtor.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{debtor.phone}</div>
                    </div>
                    <span className="font-mono font-bold text-rose-600 text-xs">
                      {formatCurrency(debtor.totalOwed)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}