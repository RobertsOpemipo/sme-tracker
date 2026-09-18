// src/app/dashboard/reconciliation/page.tsx
import { db } from "@/lib/db";
import { getDailyShiftTotals } from "@/app/actions/operations";
import { formatCurrency } from "@/lib/utils";
import { CashierZReportClient } from "@/components/reconciliation/CashierZReportClient";
import { Calendar, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReconciliationPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const business = await db.business.findFirst();
  const totals = await getDailyShiftTotals(business?.id || "", date);

  // Today's default string YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];
  const currentDateStr = date || todayStr;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Date Selector */}
      <div className="border-b border-brand-border/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted bg-brand-surface px-2 py-0.5 rounded-md border border-brand-border">
              Shift Closure &amp; Auditing
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-ink mt-1">
            Daily Cashier Reconciliation (Z-Report)
          </h1>
        </div>

        {/* Shift Date Filter Form */}
        <form className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="date"
              name="date"
              defaultValue={currentDateStr}
              className="pl-8 pr-3 py-1.5 text-xs font-mono font-bold bg-white border border-brand-border rounded-xl text-brand-ink focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-brand-ink hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <span>Load Shift</span>
          </button>
        </form>
      </div>

      {/* System Shift Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
            System Till Cash
          </span>
          <span className="mt-1 text-xl font-black font-mono text-brand-ink block">
            {formatCurrency(totals.expectedCash)}
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            {totals.salesCount} sales + {totals.debtPaymentsCount} repayments
          </span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
            Direct Bank Transfers
          </span>
          <span className="mt-1 text-xl font-black font-mono text-brand-ink block">
            {formatCurrency(totals.expectedTransfer)}
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            Bank account verified
          </span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
            POS Terminal Slips
          </span>
          <span className="mt-1 text-xl font-black font-mono text-brand-ink block">
            {formatCurrency(totals.expectedPos)}
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            Card merchant settlements
          </span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-fintech-rose block">
            Accrued Credit Given
          </span>
          <span className="mt-1 text-xl font-black font-mono text-fintech-rose block">
            {formatCurrency(totals.totalCreditGiven)}
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            Uncollected today
          </span>
        </div>
      </div>

      {/* Interactive Cash Count Balancing Component */}
      <CashierZReportClient expectedCash={totals.expectedCash} />
    </div>
  );
}