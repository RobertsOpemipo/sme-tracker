// src/app/dashboard/inventory/page.tsx
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { RestockModal } from "@/components/inventory/RestockModal";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { Package, AlertTriangle, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InventoryPage() {
  const business = await db.business.findFirst();

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { businessId: business?.id },
      include: { categoryRel: true },
      orderBy: { name: "asc" },
    }),
    db.category.findMany({
      where: { businessId: business?.id },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalSKUs = products.length;
  const outOfStockCount = products.filter((p) => p.currentStock <= 0).length;
  const lowStockCount = products.filter(
    (p) => p.currentStock > 0 && p.currentStock <= p.minStockAlert
  ).length;
  const totalStockValue = products.reduce(
    (acc, p) => acc + p.costPrice * p.currentStock,
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* ----------------- Top Header ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted bg-brand-surface px-2 py-0.5 rounded-md border border-brand-border">
              Merchandise &amp; Stock
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-ink mt-1">
            Inventory Management
          </h1>
        </div>

        {/* Add Product Modal Button */}
        <div className="flex items-center gap-2">
          <AddProductDialog categories={categories} />
        </div>
      </div>

      {/* ----------------- Metric KPI Cards ----------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
            Catalog Coverage
          </span>
          <span className="mt-1 text-xl font-black font-mono text-brand-ink block">
            {totalSKUs} Items
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            Across {categories.length} categories
          </span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
            Capital Tied in Stock
          </span>
          <span className="mt-1 text-xl font-black font-mono text-brand-ink block">
            {formatCurrency(totalStockValue)}
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            At replacement buying cost
          </span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            Low Stock Alerts
          </span>
          <span className="mt-1 text-xl font-black font-mono text-amber-700 block">
            {lowStockCount} SKUs
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            Below replenishment threshold
          </span>
        </div>

        <div className="bg-brand-card border border-brand-border p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-fintech-rose block">
            Depleted / Out of Stock
          </span>
          <span className="mt-1 text-xl font-black font-mono text-fintech-rose block">
            {outOfStockCount} SKUs
          </span>
          <span className="text-[11px] text-brand-muted mt-0.5 block">
            Immediate reorder needed
          </span>
        </div>
      </div>

      {/* ----------------- Products Table ----------------- */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-brand-ink">Product Warehouse Roster</h2>
          <span className="text-xs font-mono font-bold text-brand-muted">
            {products.length} Active Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                <th className="pb-2.5">Product</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5 text-right">Cost Price (COGS)</th>
                <th className="pb-2.5 text-right">Retail Price</th>
                <th className="pb-2.5 text-center">Stock Level</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-muted">
                    No products found in inventory. Tap &quot;Add New Product&quot; above to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isOutOfStock = product.currentStock <= 0;
                  const isLowStock =
                    product.currentStock > 0 &&
                    product.currentStock <= product.minStockAlert;

                  return (
                    <tr key={product.id} className="hover:bg-brand-surface/70 transition">
                      <td className="py-3 font-bold text-brand-ink">
                        <div className="truncate max-w-[220px]">{product.name}</div>
                        {product.sku && (
                          <span className="font-mono text-[10px] text-brand-muted block">
                            {product.sku}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-brand-muted">
                        {product.categoryRel?.name || product.category || "General"}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-600">
                        {formatCurrency(product.costPrice)}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-brand-ink">
                        {formatCurrency(product.sellingPrice)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            isOutOfStock
                              ? "bg-fintech-rose-light text-fintech-rose border border-fintech-rose-border"
                              : isLowStock
                              ? "bg-fintech-amber-light text-amber-800 border border-fintech-amber-border"
                              : "bg-fintech-mint-light text-emerald-800 border border-fintech-mint-border"
                          }`}
                        >
                          {product.currentStock} units
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <RestockModal
                            product={{
                              id: product.id,
                              name: product.name,
                              costPrice: product.costPrice,
                              currentStock: product.currentStock,
                              sellingPrice: product.sellingPrice,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}