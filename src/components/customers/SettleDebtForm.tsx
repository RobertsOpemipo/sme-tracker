// src/components/customers/SettleDebtForm.tsx
"use client";

import { useState, useTransition } from "react";
import { settleCustomerDebt } from "@/app/actions/operations";
import { PaymentMethod } from "@prisma/client";
import { Loader2, DollarSign } from "lucide-react";

export function SettleDebtForm({
  customerId,
  maxOwed,
}: {
  customerId: string;
  maxOwed: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(maxOwed.toString());
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseFloat(amount);
    if (!numeric || numeric <= 0) return;

    startTransition(async () => {
      const res = await settleCustomerDebt({
        customerId,
        amount: numeric,
        paymentMethod: method,
        note,
      });
      if (res.success) {
        setIsOpen(false);
      } else {
        alert(res.error || "Payment failed");
      }
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 bg-fintech-mint text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-600 transition"
      >
        Record Debt Clearance
      </button>
    );
  }

  return (
    <form onSubmit={handleSettle} className="p-3 bg-white border border-brand-border rounded-xl shadow-md space-y-2">
      <div className="text-xs font-bold text-brand-ink">Clear Account Balance</div>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.01"
          max={maxOwed}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-28 px-2 py-1 text-xs font-mono border border-brand-border rounded-lg"
          required
        />
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          className="px-2 py-1 text-xs border border-brand-border rounded-lg bg-white"
        >
          <option value="CASH">Cash</option>
          <option value="TRANSFER">Transfer</option>
          <option value="POS">POS</option>
        </select>
      </div>
      <input
        type="text"
        placeholder="Memo / Bank Ref"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full px-2 py-1 text-xs border border-brand-border rounded-lg"
      />
      <div className="flex justify-end gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-2.5 py-1 text-xs text-brand-muted hover:text-brand-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1 bg-brand-ink text-white text-xs font-bold rounded-lg disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Post"}
        </button>
      </div>
    </form>
  );
}