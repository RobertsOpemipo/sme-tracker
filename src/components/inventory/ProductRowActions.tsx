"use client";

import { useState, useTransition } from "react";
import { Category, Product } from "@prisma/client";
import { updateProduct, deleteProduct } from "@/app/actions/inventory";
import { Edit2, Trash2, X, Loader2, AlertTriangle } from "lucide-react";

interface ProductWithCategory extends Product {
  categoryRel?: Category | null;
}

export function ProductRowActions({
  product,
  categories,
}: {
  product: ProductWithCategory;
  categories: Category[];
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCatId, setSelectedCatId] = useState(
    product.categoryId || categories[0]?.id || ""
  );
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customName, setCustomName] = useState("");

  const [isPending, startTransition] = useTransition();

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
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
      const result = await updateProduct(product.id, formData);
      if (result.success) {
        setIsEditOpen(false);
      } else {
        setError(result.error || "Failed to update product");
      }
    });
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result.success) {
        setIsDeleteOpen(false);
      } else {
        setError(result.error || "Failed to delete product");
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => {
            setError(null);
            setIsEditOpen(true);
          }}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
          title="Edit Product"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setError(null);
            setIsDeleteOpen(true);
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
          title="Delete Product"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Edit Product Details</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
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
                  defaultValue={product.name}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category *</label>
                  <select
                    value={isCustomCategory ? "CUSTOM" : selectedCatId}
                    onChange={(e) => {
                      if (e.target.value === "CUSTOM") {
                        setIsCustomCategory(true);
                        setSelectedCatId("");
                      } else {
                        setIsCustomCategory(false);
                        setSelectedCatId(e.target.value);
                      }
                    }}
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
                  <label className="text-xs font-semibold text-slate-700">SKU / Item Code</label>
                  <input
                    name="sku"
                    defaultValue={product.sku || ""}
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
                    defaultValue={product.costPrice}
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
                    defaultValue={product.sellingPrice}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Current Stock *</label>
                  <input
                    required
                    type="number"
                    name="currentStock"
                    defaultValue={product.currentStock}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Low Stock Alert At</label>
                  <input
                    type="number"
                    name="minStockAlert"
                    defaultValue={product.minStockAlert}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Product?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete <strong className="text-slate-800">{product.name}</strong>?
                  This action cannot be undone. Products tied to past sales cannot be deleted.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}