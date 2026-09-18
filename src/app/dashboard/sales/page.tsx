// src/app/dashboard/sales/page.tsx
import { db } from "@/lib/db";
import { PosRegister } from "@/components/pos/PosRegister";
import { Download } from "lucide-react";

export default async function SalesPosPage() {
  const business = await db.business.findFirst();

  const [products, customers, categories] = await Promise.all([
    db.product.findMany({
      where: { businessId: business?.id },
      include: { categoryRel: true },
      orderBy: { name: "asc" },
    }),
    db.customer.findMany({
      where: { businessId: business?.id },
      orderBy: { name: "asc" },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              Active Terminal
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-950 mt-1">
            Sales Counter &amp; POS Register
          </h1>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Fast-tap inventory checkout • Automated ledger allocation
        </p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
  <div>
    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-ink">
      Point of Sale Terminal
    </h1>
    <p className="text-xs text-brand-muted">
      Process walk-in checkouts or allocate customer credit
    </p>
  </div>

  {/* Add the export button here */}
  <div className="flex items-center gap-2">
    <a
      href="/api/export/sales"
      download
      className="px-3 py-1.5 bg-brand-card hover:bg-brand-surface border border-brand-border text-brand-ink text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5"
    >
      <Download className="w-3.5 h-3.5 text-brand-muted" />
      <span>Export Sales CSV</span>
    </a>
  </div>
</div>
      <PosRegister 
        products={products} 
        customers={customers} 
        categories={categories} 
      />
    </div>
  );
}