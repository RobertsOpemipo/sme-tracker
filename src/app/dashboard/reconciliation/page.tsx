// src/app/dashboard/reconciliation/page.tsx
import { db } from "@/lib/db";
import { getDailyShiftTotals } from "@/app/actions/operations";
import { formatCurrency } from "@/lib/utils";
import { CashierZReportClient } from "@/components/reconciliation/CashierZReportClient";
import { ShieldCheck, Receipt, Wallet, Layers } from "lucide-react";

export default async function ReconciliationPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const business = await db.business.findFirst();
  const totals = await getDailyShiftTotals(business?.id || "", date);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="border-b border-brand-border/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted bg-brand-surface px-2 py-0.5 rounded-md border border-brand-border">
              Shift Closure & Auditing
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-ink mt-1">
            Daily Cashier Reconciliation (Z-Report)
          </h1>
        </div>
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
          <span className="text-[11px] text-brand-muted mt-0.5 block">Physical bank notes expected</span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
            Direct Bank Transfers
          </span>
          <span className="mt-1 text-xl font-black font-mono text-brand-ink block">
            {formatCurrency(totals.expectedTransfer)}
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">Verified bank credits</span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
            POS Terminal Slips
          </span>
          <span className="mt-1 text-xl font-black font-mono text-brand-ink block">
            {formatCurrency(totals.expectedPos)}
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">Card merchant settlements</span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-fintech-rose block">
            Accrued Credit Given
          </span>
          <span className="mt-1 text-xl font-black font-mono text-fintech-rose block">
            {formatCurrency(totals.totalCreditGiven)}
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">Uncollected today</span>
        </div>
      </div>

      {/* Interactive Cash Count Balancing Component */}
      <CashierZReportClient expectedCash={totals.expectedCash} />
    </div>
  );
}