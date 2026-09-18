// src/app/dashboard/expenses/page.tsx
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Receipt, PlusCircle, Calendar, Layers } from "lucide-react";

export const revalidate = 0;

export default async function ExpensesPage() {
  const business = await db.business.findFirst();

  const expenses = await db.expense.findMany({
    where: { businessId: business?.id },
    orderBy: { date: "desc" },
  });

  const totalOverheads = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Group by category
  const categorySummary: Record<string, number> = {};
  expenses.forEach((e) => {
    categorySummary[e.category] = (categorySummary[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted bg-brand-surface px-2 py-0.5 rounded-md border border-brand-border">
              Cost Accounting
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-ink mt-1">
            Store Expenses &amp; Overheads
          </h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
            Total Operational Outflows
          </span>
          <span className="mt-1 text-xl font-black font-mono text-fintech-rose block">
            {formatCurrency(totalOverheads)}
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            Across {expenses.length} logged expense entries
          </span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
            Primary Cost Driver
          </span>
          <span className="mt-1 text-base font-bold text-brand-ink block truncate">
            {Object.entries(categorySummary).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"}
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            Highest cumulative operational cost
          </span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
            Expense Records
          </span>
          <span className="mt-1 text-xl font-black font-mono text-brand-ink block">
            {expenses.length}
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            Audited financial outlays
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-brand-ink">Expense Ledger</h2>
          <span className="text-xs font-mono font-bold text-brand-muted">{expenses.length} Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Title &amp; Memo</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-brand-muted">
                    No operating expenses logged yet.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-brand-surface/70 transition">
                    <td className="py-3 font-mono text-brand-muted whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-brand-ink">{expense.title}</div>
                      {expense.note && (
                        <div className="text-[10px] text-brand-muted mt-0.5">{expense.note}</div>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-brand-surface border border-brand-border rounded-md text-[10px] font-bold text-brand-ink">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-fintech-rose whitespace-nowrap">
                      -{formatCurrency(expense.amount)}
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