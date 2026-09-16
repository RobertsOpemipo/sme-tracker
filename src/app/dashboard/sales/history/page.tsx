import { getSalesHistory } from "@/app/actions/sales";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";

export default async function SalesHistoryPage() {
  const salesHistory = await getSalesHistory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/sales"
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">Transaction History</h2>
            <p className="text-sm text-slate-500">
              Audit log of all processed sales, receipts, payments, and balances.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Receipt #</th>
              <th className="px-5 py-3.5">Date & Time</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Items</th>
              <th className="px-5 py-3.5">Method</th>
              <th className="px-5 py-3.5 text-right">Total Bill</th>
              <th className="px-5 py-3.5 text-right">Amount Paid</th>
              <th className="px-5 py-3.5 text-right">Balance Due</th>
              <th className="px-5 py-3.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {salesHistory.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                  <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No transactions recorded yet.
                </td>
              </tr>
            ) : (
              salesHistory.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    {sale.receiptNumber}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                    {new Date(sale.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">
                    {sale.customer ? (
                      <div>
                        <div>{sale.customer.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{sale.customer.phone}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">Walk-in Customer</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {sale.items.reduce((acc, i) => acc + i.quantity, 0)} units
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(sale.totalAmount)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-emerald-600 font-semibold">
                    {formatCurrency(sale.amountPaid)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-rose-600">
                    {sale.balanceDue > 0 ? formatCurrency(sale.balanceDue) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sale.paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : sale.paymentStatus === "PARTIAL"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
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
  );
}