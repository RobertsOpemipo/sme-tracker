"use client";

import { useState, useTransition } from "react";
import { createExpense } from "@/app/actions/expenses";
import { Plus, X, Loader2, Receipt } from "lucide-react";
import { ExpenseCategory } from "@prisma/client";

export function AddExpenseDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createExpense(formData);
      if (res.success) {
        setIsOpen(false);
        form.reset();
      } else {
        setError(res.error || "Failed to record expense");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition"
      >
        <Plus className="w-4 h-4" />
        Record Expense
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Record Business Expense</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-800">Expense Title *</label>
                <input
                  required
                  name="title"
                  placeholder="e.g. Generator Diesel / NEPA bill / Delivery bike repair"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">Amount (₦) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    name="amount"
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">Category *</label>
                  <select
                    name="category"
                    defaultValue={ExpenseCategory.UTILITIES}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="UTILITIES">Utilities (Power/Fuel)</option>
                    <option value="LOGISTICS">Logistics & Dispatch</option>
                    <option value="RENT">Rent & Store Space</option>
                    <option value="SALARIES">Staff Wages</option>
                    <option value="PACKAGING">Packaging Bags</option>
                    <option value="MISCELLANEOUS">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-800">Note / Reference</label>
                <input
                  name="note"
                  placeholder="Optional details or receipt memo"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}