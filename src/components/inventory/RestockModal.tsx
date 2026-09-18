// src/components/inventory/RestockModal.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { processRestock } from "@/app/actions/operations";
import { formatCurrency } from "@/lib/utils";
import { ToastNotification } from "@/components/ui/ToastNotification";
import { PlusCircle, Loader2, X } from "lucide-react";

export function RestockModal({
  product,
}: {
  product: { id: string; name: string; costPrice: number; currentStock: number; sellingPrice: number };
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("10");
  const [newBuyingCost, setNewBuyingCost] = useState(product.costPrice.toString());
  const [newSellingPrice, setNewSellingPrice] = useState(product.sellingPrice.toString());
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const qty = parseInt(quantity, 10) || 0;
  const cost = parseFloat(newBuyingCost) || 0;
  const totalUnits = product.currentStock + qty;
  const predictedWeightedAvg =
    totalUnits > 0
      ? (product.currentStock * product.costPrice + qty * cost) / totalUnits
      : cost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await processRestock({
        productId: product.id,
        quantityAdded: qty,
        newBuyingCost: cost,
        newSellingPrice: parseFloat(newSellingPrice),
        supplierNote: note,
      });

      if (res.success) {
        setIsOpen(false);
        setToastMessage(`Restocked ${qty} units of ${product.name}!`);
        router.refresh();
      } else {
        alert(res.error || "Restock failed");
      }
    });
  };

  return (
    <>
      {toastMessage && (
        <ToastNotification
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-2.5 py-1.5 bg-brand-surface hover:bg-slate-200 border border-brand-border rounded-lg text-xs font-bold text-brand-ink flex items-center gap-1 transition"
      >
        <PlusCircle className="w-3.5 h-3.5 text-fintech-mint" /> Restock
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-brand-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-brand-ink">Restock Consignment Intake</h3>
                <p className="text-xs text-brand-muted truncate max-w-xs">{product.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-brand-muted hover:text-brand-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-brand-muted block uppercase text-[10px]">
                    Qty Received
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full mt-1 border border-brand-border rounded-xl px-3 py-1.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-muted block uppercase text-[10px]">
                    New Supplier Unit Cost (₦)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={newBuyingCost}
                    onChange={(e) => setNewBuyingCost(e.target.value)}
                    className="w-full mt-1 border border-brand-border rounded-xl px-3 py-1.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-brand-surface border border-brand-border space-y-1">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Current Shelf COGS:</span>
                  <span className="font-mono font-bold">{formatCurrency(product.costPrice)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold border-t border-brand-border/60 pt-1">
                  <span>Recomputed Weighted COGS:</span>
                  <span className="font-mono">{formatCurrency(predictedWeightedAvg)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-brand-muted block uppercase text-[10px]">
                  Adjust Retail Selling Price (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={newSellingPrice}
                  onChange={(e) => setNewSellingPrice(e.target.value)}
                  className="w-full mt-1 border border-brand-border rounded-xl px-3 py-1.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-brand-muted block uppercase text-[10px]">
                  Supplier Slip / Waybill Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Invoice #PO-904 from Nestle Rep"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full mt-1 border border-brand-border rounded-xl px-3 py-1.5"
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
                  className="px-4 py-1.5 bg-brand-ink text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Commit Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}