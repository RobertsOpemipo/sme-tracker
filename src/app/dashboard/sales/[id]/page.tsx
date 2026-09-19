// src/app/dashboard/sales/[id]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReceiptPrintButton } from "@/components/receipts/ReceiptPrintButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SaleReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sale = await db.sale.findFirst({
    where: {
      OR: [{ id }, { receiptNumber: id }],
    },
    include: {
      customer: true,
      business: true,
      items: {
        include: { product: true },
      },
    },
  });

  if (!sale) {
    notFound();
  }

  const totalItemsCount = sale.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="max-w-md mx-auto space-y-4 pb-16">
      {/* Top Controls (Hidden during physical print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/sales/history"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to History
        </Link>
        <ReceiptPrintButton />
      </div>

      {/* 58mm/80mm Thermal Receipt Canvas */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm font-mono text-xs space-y-4 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full">
        {/* Header Branding */}
        <div className="text-center border-b border-dashed border-slate-300 pb-3">
          <h1 className="text-sm sm:text-base font-black uppercase text-slate-950 tracking-tight">
            {sale.business.name}
          </h1>
          {sale.business.phone && (
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              Tel: {sale.business.phone}
            </p>
          )}
          <div className="mt-2 inline-block bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 uppercase">
            Official Receipt
          </div>
          <p className="font-bold text-slate-900 mt-1">#{sale.receiptNumber}</p>
        </div>

        {/* Transaction Metadata */}
        <div className="text-[11px] space-y-1 text-slate-500 border-b border-dashed border-slate-300 pb-3">
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="text-slate-900 font-medium">
              {new Date(sale.createdAt).toLocaleString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="text-slate-900 font-bold">
              {sale.customer ? sale.customer.name : "Walk-in Customer"}
            </span>
          </div>
          {sale.customer?.phone && (
            <div className="flex justify-between text-[10px]">
              <span>Contact:</span>
              <span className="text-slate-700">{sale.customer.phone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tender:</span>
            <span className="text-slate-900 font-bold uppercase">{sale.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span
              className={`font-bold ${
                sale.paymentStatus === "PAID"
                  ? "text-emerald-700"
                  : sale.paymentStatus === "PARTIAL"
                  ? "text-amber-700"
                  : "text-rose-700"
              }`}
            >
              {sale.paymentStatus}
            </span>
          </div>
        </div>

        {/* Itemized Line Records */}
        <div className="divide-y divide-slate-100">
          <div className="text-[10px] uppercase font-bold text-slate-400 pb-1 flex justify-between">
            <span>Item Description</span>
            <span>Total</span>
          </div>
          {sale.items.map((it) => (
            <div key={it.id} className="py-2 flex justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 truncate">
                  {it.product.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {it.quantity} x {formatCurrency(it.unitSellingPrice)}
                </div>
              </div>
              <div className="font-bold text-slate-900 self-center whitespace-nowrap">
                {formatCurrency(it.totalRevenue)}
              </div>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="border-t border-dashed border-slate-300 pt-3 space-y-1 text-right text-[11px]">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal ({totalItemsCount} units):</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>

          {sale.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Discount:</span>
              <span>-{formatCurrency(sale.discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-black text-slate-950 border-t border-slate-200 pt-1">
            <span>Total Invoiced:</span>
            <span>{formatCurrency(sale.totalAmount)}</span>
          </div>

          <div className="flex justify-between text-emerald-700 font-bold">
            <span>Amount Paid:</span>
            <span>{formatCurrency(sale.amountPaid)}</span>
          </div>

          {sale.balanceDue > 0 && (
            <div className="flex justify-between text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
              <span>Outstanding Debt Due:</span>
              <span>{formatCurrency(sale.balanceDue)}</span>
            </div>
          )}
        </div>

        {/* Footer Notes & Barcode */}
        <div className="border-t border-dashed border-slate-300 pt-3 text-center space-y-1 text-[10px] text-slate-500 font-sans">
          {sale.notes && (
            <p className="italic text-slate-600 font-mono text-[9px] mb-1">
              Note: {sale.notes}
            </p>
          )}
          <p className="font-bold text-slate-700">Thank you for your patronage!</p>
          <p className="text-[9px]">Goods sold in good condition cannot be returned.</p>
        </div>
      </div>
    </div>
  );
}