import { getCustomers } from "@/app/actions/customers";
import { AddCustomerDialog, CollectPaymentDialog } from "@/components/customers/CustomerActions";
import { formatCurrency } from "@/lib/utils";
import { Users, AlertCircle, CheckCircle2 } from "lucide-react";

export default async function CustomersPage() {
  const customers = await getCustomers();

  const totalOutstanding = customers.reduce((sum, c) => sum + c.totalOwed, 0);
  const totalDebtors = customers.filter((c) => c.totalOwed > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">Customer & Debtor Directory</h2>
          <p className="text-sm text-slate-500">
            Track customer records, credit histories, and collect outstanding balances.
          </p>
        </div>
        <AddCustomerDialog />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Registered Customers</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{customers.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Customers with Debt</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{totalDebtors}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Outstanding Receivables</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {formatCurrency(totalOutstanding)}
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-6 py-3.5">Phone Number</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5 text-right whitespace-nowrap">Outstanding Debt</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No customers registered yet. Add your first customer above or record a sale.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const hasDebt = customer.totalOwed > 0;

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {customer.email || "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className={hasDebt ? "text-rose-600" : "text-slate-400"}>
                          {formatCurrency(customer.totalOwed)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                            hasDebt
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {hasDebt ? (
                            <>
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                              Owing
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Clean
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <CollectPaymentDialog customer={customer} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}