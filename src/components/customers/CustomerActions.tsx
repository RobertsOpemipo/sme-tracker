// src/components/customers/CustomerActions.tsx
"use client";

import { useState, useTransition } from "react";
import { Customer } from "@prisma/client";
import { recordDebtPayment, createCustomer } from "@/app/actions/customers";
import { formatCurrency } from "@/lib/utils";
import { 
  DollarSign, 
  X, 
  Loader2, 
  UserPlus, 
  Banknote, 
  Smartphone, 
  CreditCard, 
  ArrowRight,
  Sparkles
} from "lucide-react";

export function AddCustomerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createCustomer(formData);
      if (res.success) {
        setIsOpen(false);
        form.reset();
      } else {
        setError(res.error || "Failed to create customer");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-xs"
      >
        <UserPlus className="w-4 h-4" />
        New Customer
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Add Customer Profile</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  required
                  name="name"
                  placeholder="e.g. Adebayo Ogunlesi"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Phone Number *</label>
                <input
                  required
                  name="phone"
                  placeholder="e.g. 08012345678"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address (Optional)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="customer@example.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function CollectPaymentDialog({ customer }: { customer: Customer }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amountInput, setAmountInput] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"TRANSFER" | "CASH" | "POS">("TRANSFER");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const numericAmount = Math.max(0, parseFloat(amountInput) || 0);
  const remainingDebt = Math.max(0, customer.totalOwed - numericAmount);
  const isFullSettlement = numericAmount >= customer.totalOwed;

  // Percentage shortcuts
  const applyPreset = (percentage: number) => {
    const calculated = Math.round((customer.totalOwed * percentage) / 100);
    setAmountInput(calculated.toString());
  };

  // Quick memo tag suggestions
  const memoPresets = [
    "Bank Transfer",
    "Cash Handover",
    "POS Terminal Receipt",
    "Partial Repayment",
    "Final Clearance",
  ];

  const handlePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (numericAmount <= 0) {
      setError("Please enter a valid payment amount greater than 0");
      return;
    }

    if (numericAmount > customer.totalOwed) {
      setError(`Payment cannot exceed total outstanding debt of ${formatCurrency(customer.totalOwed)}`);
      return;
    }

    const formData = new FormData();
    formData.set("customerId", customer.id);
    formData.set("amount", numericAmount.toString());
    formData.set("paymentMethod", paymentMethod);
    if (note.trim()) formData.set("note", note.trim());

    startTransition(async () => {
      const res = await recordDebtPayment(formData);
      if (res.success) {
        setIsOpen(false);
        setAmountInput("");
        setNote("");
      } else {
        setError(res.error || "Payment recording failed");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setAmountInput(customer.totalOwed.toString());
        }}
        disabled={customer.totalOwed <= 0}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
      >
        <DollarSign className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
        Collect Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4.5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">Record Debt Clearance</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      Debtor
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {customer.name} <span className="text-slate-300">•</span> <span className="font-mono">{customer.phone}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePayment} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Debt Tally & Dynamic Simulator */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/80 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
                    Current Balance
                  </span>
                  <span className="text-lg font-bold font-mono text-rose-600 mt-0.5 block">
                    {formatCurrency(customer.totalOwed)}
                  </span>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
                    Remaining After
                  </span>
                  <span
                    className={`text-lg font-bold font-mono mt-0.5 block ${
                      remainingDebt === 0 ? "text-emerald-600" : "text-slate-900"
                    }`}
                  >
                    {formatCurrency(remainingDebt)}
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 tracking-tight">Amount Receiving (₦) *</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPreset(25)}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset(50)}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset(100)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Pay in Full
                    </button>
                  </div>
                </div>

                <div className="relative rounded-xl">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-sm">
                    ₦
                  </div>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="1"
                    max={customer.totalOwed}
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-4 py-2 text-base font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                  />
                </div>
              </div>

              {/* Payment Channel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 tracking-tight">
                    Payment Channel
                  </label>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {paymentMethod === "TRANSFER" && "Direct Bank Transfer"}
                    {paymentMethod === "CASH" && "Cash Handover"}
                    {paymentMethod === "POS" && "POS / Card Swipe"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("TRANSFER")}
                    className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                      paymentMethod === "TRANSFER"
                        ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500/20 shadow-2xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          paymentMethod === "TRANSFER"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          paymentMethod === "TRANSFER"
                            ? "border-emerald-600 bg-emerald-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {paymentMethod === "TRANSFER" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-xs font-bold text-slate-900 leading-tight">Transfer</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Bank / OPay / App</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                      paymentMethod === "CASH"
                        ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500/20 shadow-2xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          paymentMethod === "CASH"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                      </div>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          paymentMethod === "CASH"
                            ? "border-emerald-600 bg-emerald-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {paymentMethod === "CASH" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-xs font-bold text-slate-900 leading-tight">Cash</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Physical notes</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("POS")}
                    className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                      paymentMethod === "POS"
                        ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500/20 shadow-2xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          paymentMethod === "POS"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          paymentMethod === "POS"
                            ? "border-emerald-600 bg-emerald-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {paymentMethod === "POS" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-xs font-bold text-slate-900 leading-tight">POS Terminal</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Debit card slip</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Reference & Suggestions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 tracking-tight">
                    Payment Note / Reference
                  </label>
                  <span className="text-[11px] text-slate-400">Optional</span>
                </div>

                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. OPay transfer ref #90213 or cash handed to store clerk"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-semibold text-slate-400 mr-0.5">Suggestions:</span>
                  {memoPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNote(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                        note === preset
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || numericAmount <= 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{isFullSettlement ? "Confirm Full Settlement" : "Post Payment"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}