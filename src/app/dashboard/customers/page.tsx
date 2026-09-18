// src/app/dashboard/customers/page.tsx
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight, Download, Users, UserPlus } from "lucide-react";
import { AddCustomerModal } from "@/components/customers/AddCustomerModal";

export const revalidate = 0;

export default async function CustomersPage() {
  const business = await db.business.findFirst();

  const customers = await db.customer.findMany({
    where: { businessId: business?.id },
    include: {
      sales: {
        where: { balanceDue: { gt: 0 } },
      },
    },
    orderBy: { totalOwed: "desc" },
  });

  const totalReceivables = customers.reduce((acc, c) => acc + c.totalOwed, 0);
  const activeDebtors = customers.filter((c) => c.totalOwed > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted bg-brand-surface px-2 py-0.5 rounded-md border border-brand-border">
              Accounts Receivable
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-ink mt-1">
            Customer Credit Ledger
          </h1>
        </div>

        {/* Actions Deck */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/export/sales"
            download
            className="px-3 py-1.5 bg-brand-surface hover:bg-slate-200 border border-brand-border text-brand-ink text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-brand-muted" />
            <span>Export CSV</span>
          </a>
          <AddCustomerModal businessId={business?.id || ""} />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
            Total Ledger Accounts
          </span>
          <span className="mt-1 text-xl font-black font-mono text-brand-ink block">
            {customers.length} Profiles
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            Registered customer base
          </span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-fintech-rose block">
            Total Outstanding Exposure
          </span>
          <span className="mt-1 text-xl font-black font-mono text-fintech-rose block">
            {formatCurrency(totalReceivables)}
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            Money tied up in customer credit
          </span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            Active Debtors
          </span>
          <span className="mt-1 text-xl font-black font-mono text-amber-700 block">
            {activeDebtors.length} Customers
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            Accounts with pending balances
          </span>
        </div>
      </div>

      {/* Customers List Table */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-brand-ink">Customer Ledger Index</h2>
          <span className="text-xs font-mono font-bold text-brand-muted">
            Ranked by debt magnitude
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                <th className="pb-2.5">Customer</th>
                <th className="pb-2.5">Contact</th>
                <th className="pb-2.5 text-center">Open Credit Slips</th>
                <th className="pb-2.5 text-right">Balance Owed</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-muted">
                    No customer accounts on file.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-surface/70 transition">
                    <td className="py-3 font-bold text-brand-ink">
                      <Link
                        href={`/dashboard/customers/${c.id}`}
                        className="hover:underline flex items-center gap-1.5"
                      >
                        {c.name}
                        <ArrowUpRight className="w-3 h-3 text-brand-muted" />
                      </Link>
                    </td>
                    <td className="py-3 font-mono text-brand-muted">{c.phone}</td>
                    <td className="py-3 text-center font-mono font-semibold">
                      {c.sales.length}
                    </td>
                    <td className="py-3 text-right font-mono font-black">
                      <span
                        className={
                          c.totalOwed > 0 ? "text-fintech-rose" : "text-fintech-mint"
                        }
                      >
                        {formatCurrency(c.totalOwed)}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/dashboard/customers/${c.id}`}
                        className="inline-flex items-center px-3 py-1 bg-brand-surface hover:bg-slate-200 border border-brand-border rounded-xl text-xs font-bold text-brand-ink transition"
                      >
                        View Ledger &amp; Settle
                      </Link>
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