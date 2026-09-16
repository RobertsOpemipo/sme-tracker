// src/components/inventory/AddProductDialog.tsx
"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2, HelpCircle } from "lucide-react";
import { createProduct } from "@/app/actions/inventory";
import type { Category } from "@prisma/client";

// 1. Declare the props interface
interface AddProductDialogProps {
  categories: Category[];
}

// 2. Accept categories in the function arguments
export function AddProductDialog({ categories }: AddProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

    if (isCustomCategory) {
      formData.set("category", customName.trim());
    } else {
      const found = categories.find((c) => c.id === selectedCatId);
      if (found) {
        formData.set("categoryId", found.id);
        formData.set("category", found.name);
      }
    }

    startTransition(async () => {
      const result = await createProduct(formData);
      if (result.success) {
        setIsOpen(false);
        form.reset();
        setIsCustomCategory(false);
        setCustomName("");
      } else {
        setError(result.error || "Something went wrong");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
      >
        <Plus className="w-4 h-4" />
        Add New Product
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add New Inventory Item</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
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
                <label className="text-xs font-semibold text-slate-700">Product Name *</label>
                <input
                  required
                  name="name"
                  placeholder="e.g. 50kg Royal Basmati Rice"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category *</label>
                  <select
                    value={isCustomCategory ? "CUSTOM" : selectedCatId}
                    onChange={handleCategoryChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                      placeholder="Type category name"
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
                      title="Stock Keeping Unit: Store identifier for fast lookups or barcode scanning"
                      className="cursor-help text-slate-400 hover:text-slate-600"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <input
                    name="sku"
                    placeholder="e.g. RICE-50KG (Optional)"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Cost Price (COGS) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    name="costPrice"
                    placeholder="Cost from supplier"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Selling Price *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    name="sellingPrice"
                    placeholder="Price charged to customer"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Initial Stock *</label>
                  <input
                    required
                    type="number"
                    name="currentStock"
                    defaultValue={0}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Low Stock Alert At</label>
                  <input
                    type="number"
                    name="minStockAlert"
                    defaultValue={5}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
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
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
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