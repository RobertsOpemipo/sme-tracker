// src/components/receipts/ThermalReceiptModal.tsx
"use client";

import { useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { Printer, X } from "lucide-react";

export interface ReceiptSaleItem {
  name: string;
  quantity: number;
  unitSellingPrice: number;
  totalRevenue: number;
}

export interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptNumber: string;
  date: Date;
  businessName: string;
  businessPhone?: string | null;
  cashierName?: string;
  customerName?: string;
  items: ReceiptSaleItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: string;
}

export function ThermalReceiptModal({
  isOpen,
  onClose,
  receiptNumber,
  date,
  businessName,
  businessPhone,
  cashierName = "Till Register 1",
  customerName,
  items,
  subtotal,
  discount,
  totalAmount,
  amountPaid,
  balanceDue,
  paymentMethod,
}: ThermalReceiptModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-brand-border overflow-hidden">
        {/* Modal Controls Header */}
        <div className="p-3 border-b border-brand-border flex items-center justify-between bg-brand-surface print:hidden">
          <span className="text-xs font-bold text-brand-ink flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Thermal Print Preview (58mm)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-brand-ink text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
            >
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-brand-muted hover:text-brand-ink hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 58mm / 80mm Print Layout Sheet */}
        <div
          ref={printAreaRef}
          className="p-4 bg-white text-black font-mono text-[11px] leading-tight select-none print:w-[58mm] print:p-0 print:m-0"
        >
          <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-black">
            <div className="text-sm font-black tracking-tight uppercase">{businessName}</div>
            {businessPhone && <div>Tel: {businessPhone}</div>}
            <div className="text-[10px] text-gray-600">*** SALES SLIP ***</div>
          </div>

          <div className="py-2 space-y-0.5 border-b border-dashed border-black text-[10px]">
            <div className="flex justify-between">
              <span>RC#: {receiptNumber}</span>
              <span>{new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div>Date: {new Date(date).toLocaleDateString()}</div>
            <div>Cashier: {cashierName}</div>
            {customerName && <div>Customer: {customerName}</div>}
          </div>

          {/* Line Items Table */}
          <div className="py-2 border-b border-dashed border-black">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black text-[10px]">
                  <th className="pb-1">QTY/ITEM</th>
                  <th className="pb-1 text-right">PRICE</th>
                  <th className="pb-1 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dotted divide-gray-300">
                {items.map((it, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-1">
                      <div className="font-bold line-clamp-1">{it.name}</div>
                      <div className="text-[9px] text-gray-600">x{it.quantity}</div>
                    </td>
                    <td className="py-1 text-right">{formatCurrency(it.unitSellingPrice)}</td>
                    <td className="py-1 text-right font-bold">{formatCurrency(it.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Financial Settlement */}
          <div className="py-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>DISCOUNT:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm border-t border-black pt-1">
              <span>TOTAL DUE:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>TENDER ({paymentMethod}):</span>
              <span>{formatCurrency(amountPaid)}</span>
            </div>
            {balanceDue > 0 && (
              <div className="flex justify-between font-bold text-red-600 pt-0.5 border-t border-dashed border-gray-400">
                <span>REMAINING DEBT:</span>
                <span>{formatCurrency(balanceDue)}</span>
              </div>
            )}
          </div>

          {/* Footer Receipt Barcode Strip */}
          <div className="text-center pt-3 space-y-1 border-t border-dashed border-black">
            <div className="text-[10px] font-bold">THANK YOU FOR YOUR PATRONAGE!</div>
            <div className="text-[9px] text-gray-600">Goods sold in good condition are not returnable</div>
            <div className="font-mono tracking-widest text-[9px] pt-1">|| | |||| || ||| ||||||| |</div>
          </div>
        </div>
      </div>
    </div>
  );
}