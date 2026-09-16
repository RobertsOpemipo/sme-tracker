// src/app/dashboard/sales/page.tsx
import { db } from "@/lib/db";
import { PosRegister } from "@/components/pos/PosRegister";

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

      <PosRegister 
        products={products} 
        customers={customers} 
        categories={categories} 
      />
    </div>
  );
}