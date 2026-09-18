// src/components/customers/AddCustomerModal.tsx
"use client";

import { useState, useTransition } from "react";
import { createCustomer } from "@/app/actions/operations";
import { UserPlus, Loader2, X } from "lucide-react";

export function AddCustomerModal({ businessId }: { businessId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createCustomer({ businessId, name, phone, email });
      if (res.success) {
        setName("");
        setPhone("");
        setEmail("");
        setIsOpen(false);
      } else {
        setError(res.error || "Failed to create customer");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-brand-ink hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>New Profile</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-brand-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-sm font-bold text-brand-ink">Add Customer Profile</h3>
              <button onClick={() => setIsOpen(false)} className="text-brand-muted hover:text-brand-ink">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2 bg-fintech-rose-light text-fintech-rose border border-fintech-rose-border rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-brand-muted block uppercase text-[10px]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Adebayo Ogunlesi"
                  className="w-full mt-1 border border-brand-border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-ink"
                />
              </div>

              <div>
                <label className="font-bold text-brand-muted block uppercase text-[10px]">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +234 803 000 0000"
                  className="w-full mt-1 border border-brand-border rounded-xl px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-brand-ink"
                />
              </div>

              <div>
                <label className="font-bold text-brand-muted block uppercase text-[10px]">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  className="w-full mt-1 border border-brand-border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-ink"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs text-brand-muted font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 bg-brand-ink text-white font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}