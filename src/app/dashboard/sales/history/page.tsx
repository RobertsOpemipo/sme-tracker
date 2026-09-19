// src/app/dashboard/sales/history/page.tsx
import { getSalesHistory } from "@/app/actions/sales";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Receipt, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SalesHistoryPage() {
  const salesHistory = await getSalesHistory();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/sales"
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
              Transaction History
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Audit log of all processed sales, receipts, payments, and balances.
            </p>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. MOBILE RESPONSIVE CARDS (< md screens)            */}
      {/* ---------------------------------------------------- */}
      <div className="block md:hidden space-y-3">
        {salesHistory.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
            <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No transactions recorded yet.
          </div>
        ) : (
          salesHistory.map((sale) => {
            const totalUnits = sale.items.reduce((acc, i) => acc + i.quantity, 0);

            return (
              <div
                key={sale.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
              >
                {/* Header: Receipt & Status */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <Link
                      href={`/dashboard/sales/${sale.id}`}
                      className="font-mono font-bold text-xs text-slate-900 flex items-center gap-1 hover:underline"
                    >
                      {sale.receiptNumber}
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </Link>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(sale.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      sale.paymentStatus === "PAID"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : sale.paymentStatus === "PARTIAL"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {sale.paymentStatus}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Customer
                    </span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {sale.customer ? sale.customer.name : "Walk-in Customer"}
                    </span>
                    {sale.customer && (
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {sale.customer.phone}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Tender &amp; Qty
                    </span>
                    <span className="font-semibold text-slate-700">
                      {sale.paymentMethod} • {totalUnits} units
                    </span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Paid</span>
                    <span className="text-emerald-600 font-bold">
                      {formatCurrency(sale.amountPaid)}
                    </span>
                  </div>

                  {sale.balanceDue > 0 && (
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-sans block">Balance</span>
                      <span className="text-rose-600 font-bold">
                        {formatCurrency(sale.balanceDue)}
                      </span>
                    </div>
                  )}

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-sans block">Total</span>
                    <span className="text-slate-900 font-black text-sm">
                      {formatCurrency(sale.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. DESKTOP FULL DATA TABLE (>= md screens)           */}
      {/* ---------------------------------------------------- */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Receipt #</th>
                <th className="px-4 py-3.5">Date &amp; Time</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5 text-center">Items</th>
                <th className="px-4 py-3.5">Method</th>
                <th className="px-4 py-3.5 text-right">Total Bill</th>
                <th className="px-4 py-3.5 text-right">Amount Paid</th>
                <th className="px-4 py-3.5 text-right">Balance Due</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {salesHistory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                salesHistory.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <Link
                        href={`/dashboard/sales/${sale.id}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        {sale.receiptNumber}
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(sale.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {sale.customer ? (
                        <div>
                          <div className="truncate max-w-[150px] font-bold">{sale.customer.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {sale.customer.phone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Walk-in</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-600 font-mono">
                      {sale.items.reduce((acc, i) => acc + i.quantity, 0)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[10px] border border-slate-200/60">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-emerald-600 font-semibold whitespace-nowrap">
                      {formatCurrency(sale.amountPaid)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600 whitespace-nowrap">
                      {sale.balanceDue > 0 ? formatCurrency(sale.balanceDue) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          sale.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : sale.paymentStatus === "PARTIAL"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
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
    </div>
  );
}