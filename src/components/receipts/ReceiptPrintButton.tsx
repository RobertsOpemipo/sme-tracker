// src/components/receipts/ReceiptPrintButton.tsx
"use client";

import { Printer } from "lucide-react";

export function ReceiptPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-3 py-1.5 bg-brand-ink hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-2xs print:hidden"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print Slip</span>
    </button>
  );
}