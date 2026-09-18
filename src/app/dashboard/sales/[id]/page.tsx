// src/app/dashboard/sales/[id]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export default async function SaleReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sale = await db.sale.findFirst({
    where: { OR: [{ id }, { receiptNumber: id }] },
    include: {
      customer: true,
      business: true,
      items: {
        include: { product: true },
      },
    },
  });

  if (!sale) notFound();

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/sales"
          className="text-xs font-bold text-brand-muted hover:text-brand-ink flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Register
        </Link>
        <button
          onClick={() => {}}
          className="px-3 py-1.5 bg-brand-ink text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" /> Print Thermal Slip
        </button>
      </div>

      <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm font-mono text-xs space-y-4">
        <div className="text-center border-b border-dashed border-brand-border pb-3">
          <h1 className="text-base font-black uppercase text-brand-ink">{sale.business.name}</h1>
          <p className="text-[10px] text-brand-muted mt-0.5">Order Receipt</p>
          <p className="font-bold text-brand-ink mt-1">#{sale.receiptNumber}</p>
        </div>

        <div className="text-[11px] space-y-1 text-brand-muted border-b border-dashed border-brand-border pb-3">
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="text-brand-ink">{new Date(sale.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="text-brand-ink font-bold">{sale.customer?.name || "Walk-In"}</span>
          </div>
          <div className="flex justify-between">
            <span>Tender:</span>
            <span className="text-brand-ink font-bold">{sale.paymentMethod}</span>
          </div>
        </div>

        <div className="divide-y divide-brand-border/60">
          {sale.items.map((it) => (
            <div key={it.id} className="py-2 flex justify-between">
              <div>
                <div className="font-bold text-brand-ink">{it.product.name}</div>
                <div className="text-[10px] text-brand-muted">{it.quantity} x {formatCurrency(it.unitSellingPrice)}</div>
              </div>
              <div className="font-bold text-brand-ink self-center">{formatCurrency(it.totalRevenue)}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-brand-border pt-3 space-y-1 text-right">
          <div className="flex justify-between text-brand-muted">
            <span>Subtotal:</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Discount:</span>
              <span>-{formatCurrency(sale.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-brand-ink border-t border-brand-border pt-1">
            <span>Total Paid:</span>
            <span>{formatCurrency(sale.amountPaid)}</span>
          </div>
          {sale.balanceDue > 0 && (
            <div className="flex justify-between text-xs font-bold text-fintech-rose">
              <span>Remaining Balance Due:</span>
              <span>{formatCurrency(sale.balanceDue)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}