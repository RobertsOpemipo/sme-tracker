import { getInventoryProducts, getCategories } from "@/app/actions/inventory";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { ProductRowActions } from "@/components/inventory/ProductRowActions";
import { formatCurrency } from "@/lib/utils";
import { calculateGrossMargin } from "@/lib/calculations";
import { AlertCircle, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default async function InventoryPage() {
  const [products, categories] = await Promise.all([
    getInventoryProducts(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">Inventory & Margins</h2>
          <p className="text-sm text-slate-500">
            Monitor stock levels, unit purchase costs, selling prices, and item profit margins.
          </p>
        </div>
        <AddProductDialog categories={categories} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Product Name</th>
                <th className="px-6 py-3.5 whitespace-nowrap">Stock Level</th>
                <th className="px-6 py-3.5 text-right whitespace-nowrap">Cost Price (COGS)</th>
                <th className="px-6 py-3.5 text-right whitespace-nowrap">Selling Price</th>
                <th className="px-6 py-3.5 text-right whitespace-nowrap">Unit Profit</th>
                <th className="px-6 py-3.5 text-right whitespace-nowrap">Margin %</th>
                <th className="px-6 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No products added yet. Click &quot;Add New Product&quot; to begin tracking inventory and profit.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const unitProfit = product.sellingPrice - product.costPrice;
                  const marginPct = calculateGrossMargin(product.sellingPrice, product.costPrice).toFixed(1);
                  const displayCategory = product.categoryRel?.name || product.category || "General Merchandise";

                  // Threshold calculations
                  const isOutOfStock = product.currentStock <= 0;
                  const isLowStock = product.currentStock <= product.minStockAlert;
                  const moderateThreshold = Math.max(product.minStockAlert * 2, product.minStockAlert + 5);
                  const isModerateStock = !isLowStock && product.currentStock <= moderateThreshold;

                  // Dynamic color styling and label
                  let badgeStyles = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  let Icon = CheckCircle2;
                  let stockText = `${product.currentStock} units in stock`;

                  if (isOutOfStock) {
                    badgeStyles = "bg-rose-50 text-rose-700 border-rose-200";
                    Icon = XCircle;
                    stockText = "0 units (Out of stock)";
                  } else if (isLowStock) {
                    badgeStyles = "bg-rose-50 text-rose-700 border-rose-200";
                    Icon = AlertCircle;
                    stockText = `${product.currentStock} units (Low stock)`;
                  } else if (isModerateStock) {
                    badgeStyles = "bg-amber-50 text-amber-700 border-amber-200";
                    Icon = AlertTriangle;
                    stockText = `${product.currentStock} units (Medium)`;
                  }

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-xs text-slate-400 font-normal">
                          {displayCategory} {product.sku ? `• SKU: ${product.sku}` : ""}
                        </div>
                      </td>

                      {/* Stock Level Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${badgeStyles}`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{stockText}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right tabular-nums text-slate-600 font-mono whitespace-nowrap">
                        {formatCurrency(product.costPrice)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-semibold text-slate-900 font-mono whitespace-nowrap">
                        {formatCurrency(product.sellingPrice)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-semibold text-emerald-600 font-mono whitespace-nowrap">
                        +{formatCurrency(unitProfit)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-medium text-slate-700 font-mono whitespace-nowrap">
                        {marginPct}%
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <ProductRowActions product={product} categories={categories} />
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