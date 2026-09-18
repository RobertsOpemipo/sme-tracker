// src/components/reconciliation/CashierZReportClient.tsx
"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Calculator, CheckCircle2, AlertTriangle, Printer } from "lucide-react";

export function CashierZReportClient({ expectedCash }: { expectedCash: number }) {
  const [actualCash, setActualCash] = useState("");
  const [notes, setNotes] = useState("");

  const actualNumeric = parseFloat(actualCash) || 0;
  const discrepancy = actualNumeric - expectedCash;
  const isBalanced = actualCash !== "" && discrepancy === 0;
  const isShortage = discrepancy < 0;
  const isOverage = discrepancy > 0;

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-brand-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-brand-ink">Drawer Cash Count Verification</h2>
          <p className="text-xs text-brand-muted">Count all physical currency in the cash drawer.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-brand-surface hover:bg-slate-200 border border-brand-border text-brand-ink rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
        >
          <Printer className="w-3.5 h-3.5" /> Print Z-Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-brand-ink block mb-1">
              Actual Physical Cash Counted (₦)
            </label>
            <input
              type="number"
              step="0.01"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              placeholder="e.g. 45000"
              className="w-full text-base font-mono font-bold border border-brand-border rounded-xl px-3 py-2 text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-ink"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-brand-ink block mb-1">
              Cashier Signature / Shift Note
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain any drawer discrepancy (e.g. ₦200 change deficit)"
              className="w-full text-xs border border-brand-border rounded-xl px-3 py-2 text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-ink h-20"
            />
          </div>
        </div>

        {/* Dynamic Balance Indicator */}
        <div className="p-4 rounded-xl border border-brand-border bg-brand-surface flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-brand-muted">Target Drawer Expectation:</span>
              <span className="font-mono font-bold text-brand-ink">{formatCurrency(expectedCash)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-brand-muted">Counted in Drawer:</span>
              <span className="font-mono font-bold text-brand-ink">{formatCurrency(actualNumeric)}</span>
            </div>
            <div className="border-t border-brand-border pt-2 flex justify-between items-baseline">
              <span className="text-xs font-black uppercase">Net Variance:</span>
              <span
                className={`font-mono text-lg font-black ${
                  isBalanced
                    ? "text-fintech-mint"
                    : isShortage
                    ? "text-fintech-rose"
                    : isOverage
                    ? "text-amber-600"
                    : "text-brand-muted"
                }`}
              >
                {discrepancy > 0 ? `+${formatCurrency(discrepancy)}` : formatCurrency(discrepancy)}
              </span>
            </div>
          </div>

          {actualCash !== "" && (
            <div
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                isBalanced
                  ? "bg-fintech-mint-light border-fintech-mint-border text-emerald-800"
                  : isShortage
                  ? "bg-fintech-rose-light border-fintech-rose-border text-fintech-rose"
                  : "bg-fintech-amber-light border-fintech-amber-border text-amber-800"
              }`}
            >
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Till is 100% balanced. Shift ready to close.
                </>
              ) : isShortage ? (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Cash Shortage Detected: Deficit of{" "}
                  {formatCurrency(Math.abs(discrepancy))}
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Cash Overage Detected: Excess of{" "}
                  {formatCurrency(discrepancy)}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}