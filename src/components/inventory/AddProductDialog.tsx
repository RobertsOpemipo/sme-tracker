// src/components/inventory/AddProductDialog.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, HelpCircle, AlertTriangle } from "lucide-react";
import { createProduct } from "@/app/actions/inventory";
import { ToastNotification } from "@/components/ui/ToastNotification";
import type { Category } from "@prisma/client";

interface AddProductDialogProps {
  categories: Category[];
}

export function AddProductDialog({ categories }: AddProductDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Initialize with first available category or blank
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || "");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customName, setCustomName] = useState("");

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "CUSTOM") {
      setIsCustomCategory(true);
      setSelectedCatId("");
    } else {
      setIsCustomCategory(false);
      setSelectedCatId(val);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Explicitly set category values to avoid foreign key mismatch
    if (isCustomCategory) {
      if (!customName.trim()) {
        setError("Please enter a name for your custom category.");
        return;
      }
      formData.delete("categoryId");
      formData.set("category", customName.trim());
    } else {
      const chosen = categories.find((c) => c.id === selectedCatId);
      if (chosen) {
        formData.set("categoryId", chosen.id);
        formData.set("category", chosen.name);
      } else {
        formData.delete("categoryId");
        formData.set("category", "General");
      }
    }

    startTransition(async () => {
      const result = await createProduct(formData);
      if (result.success) {
        setIsOpen(false);
        form.reset();
        setIsCustomCategory(false);
        setCustomName("");
        setToastMessage("Product added to inventory successfully!");
        router.refresh();
      } else {
        setError(result.error || "Unable to save product.");
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
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
      >
        <Plus className="w-3.5 h-3.5" />
        Add New Product
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Add New Inventory Item</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Product Name *</label>
                <input
                  required
                  name="name"
                  placeholder="e.g. Golden Penny Spaghetti (500g)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category *</label>
                  <select
                    value={isCustomCategory ? "CUSTOM" : selectedCatId}
                    onChange={handleCategoryChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Add Custom Category</option>
                  </select>

                  {isCustomCategory && (
                    <input
                      required
                      type="text"
                      placeholder="Type custom category name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="mt-2 w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">SKU / Item Code</label>
                    <span
                      title="Stock Keeping Unit code for barcode tracking"
                      className="cursor-help text-slate-400 hover:text-slate-600"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <input
                    name="sku"
                    placeholder="e.g. PRO-SPA-099 (Optional)"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Cost Price (COGS) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    name="costPrice"
                    placeholder="e.g. 650.00"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Selling Price *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    name="sellingPrice"
                    placeholder="e.g. 900.00"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Initial Stock *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    name="currentStock"
                    defaultValue={10}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Low Stock Alert At</label>
                  <input
                    type="number"
                    min="1"
                    name="minStockAlert"
                    defaultValue={5}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}