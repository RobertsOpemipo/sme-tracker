// src/app/dashboard/customers/[id]/page.tsx
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";
import { SettleDebtForm } from "@/components/customers/SettleDebtForm";
import { User, Phone, Mail, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
      },
      debtPayments: {
        orderBy: { paidAt: "desc" },
      },
    },
  });

  if (!customer) notFound();

  return (
    <div className="space-y-6 pb-12">
      {/* Customer Header Banner */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted bg-brand-surface px-2 py-0.5 rounded-md border border-brand-border">
              Customer Account
            </span>
          </div>
          <h1 className="text-2xl font-black text-brand-ink">{customer.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> {customer.phone}
            </span>
            {customer.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {customer.email}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Customer since {new Date(customer.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Debt Exposure Card & Pay Down Form */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="p-3.5 rounded-xl border border-brand-border bg-brand-surface">
            <span className="text-[10px] font-bold text-brand-muted uppercase block">Ledger Outstanding</span>
            <span
              className={`font-mono text-xl font-black ${
                customer.totalOwed > 0 ? "text-fintech-rose" : "text-fintech-mint"
              }`}
            >
              {formatCurrency(customer.totalOwed)}
            </span>
          </div>

          {customer.totalOwed > 0 && (
            <SettleDebtForm customerId={customer.id} maxOwed={customer.totalOwed} />
          )}
        </div>
      </div>

      {/* Grid: Sales Ledger vs Payment History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 cols: Orders on Credit */}
        <div className="lg:col-span-7 bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-brand-ink">Invoiced Purchases & Balances</h2>
          <div className="divide-y divide-brand-border/60">
            {customer.sales.length === 0 ? (
              <div className="py-6 text-center text-xs text-brand-muted">No sales history on file.</div>
            ) : (
              customer.sales.map((sale) => (
                <div key={sale.id} className="py-3 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-brand-ink">{sale.receiptNumber}</span>
                    <span className="text-[10px] text-brand-muted block mt-0.5">
                      {new Date(sale.createdAt).toLocaleDateString()} via {sale.paymentMethod}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-brand-ink block">
                      {formatCurrency(sale.totalAmount)}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        sale.balanceDue > 0 ? "text-fintech-rose" : "text-fintech-mint"
                      }`}
                    >
                      {sale.balanceDue > 0 ? `Unpaid: ${formatCurrency(sale.balanceDue)}` : "Settled"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 5 cols: Settlement Receipts */}
        <div className="lg:col-span-5 bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-brand-ink">Audit: Debt Clearances Log</h2>
          <div className="divide-y divide-brand-border/60">
            {customer.debtPayments.length === 0 ? (
              <div className="py-6 text-center text-xs text-brand-muted">No repayment entries logged yet.</div>
            ) : (
              customer.debtPayments.map((payment) => (
                <div key={payment.id} className="py-3 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fintech-mint shrink-0" />
                    <div>
                      <span className="font-bold text-brand-ink">{payment.paymentMethod} Payment</span>
                      <span className="text-[10px] text-brand-muted block">
                        {new Date(payment.paidAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-emerald-700">
                      +{formatCurrency(payment.amount)}
                    </span>
                    {payment.note && (
                      <span className="text-[9px] text-brand-muted block italic truncate max-w-[120px]">
                        {payment.note}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}