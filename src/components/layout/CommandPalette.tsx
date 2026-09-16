// src/components/layout/CommandPalette.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { searchStore, SearchResults } from "@/app/actions/search";
import { formatCurrency } from "@/lib/utils";
import { 
  Search, 
  Package, 
  User, 
  Receipt, 
  Loader2, 
  ArrowRight, 
  X,
  CornerDownLeft
} from "lucide-react";

function CommandPaletteModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ products: [], customers: [], sales: [] });
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    setQuery(term);
    if (term.trim().length < 2) {
      setResults({ products: [], customers: [], sales: [] });
      return;
    }

    startTransition(async () => {
      const data = await searchStore(term);
      setResults(data);
    });
  };

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const hasResults =
    results.products.length > 0 ||
    results.customers.length > 0 ||
    results.sales.length > 0;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search inventory, debtors, or receipt numbers..."
            className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {isPending ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
          ) : query ? (
            <button onClick={() => handleSearch("")} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="text-[10px] font-mono text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Stream */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {query.trim().length >= 2 && !isPending && !hasResults && (
            <div className="py-10 text-center text-slate-400">
              No matching records found for &quot;{query}&quot;
            </div>
          )}

          {/* Products Group */}
          {results.products.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Products &amp; Inventory
              </div>
              <div className="space-y-1 mt-1">
                {results.products.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate("/dashboard/inventory")}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 flex items-center justify-between text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.sku ? `SKU: ${item.sku} • ` : ""}{item.currentStock} in stock
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        {formatCurrency(item.sellingPrice)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers Group */}
          {results.customers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Customers &amp; Debtors
              </div>
              <div className="space-y-1 mt-1">
                {results.customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate("/dashboard/customers")}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 flex items-center justify-between text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.phone}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold ${c.totalOwed > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {c.totalOwed > 0 ? `Owes ${formatCurrency(c.totalOwed)}` : "Balance Clear"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transactions Group */}
          {results.sales.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Sales Receipts
              </div>
              <div className="space-y-1 mt-1">
                {results.sales.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate("/dashboard/sales/history")}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 flex items-center justify-between text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-slate-900">{s.receiptNumber}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        {formatCurrency(s.totalAmount)}
                      </div>
                      <span className={`text-[10px] font-bold ${s.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>
                        {s.paymentStatus}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> Select
            </span>
            <span className="flex items-center gap-1">
              <ArrowRight className="w-3 h-3" /> Jump to view
            </span>
          </div>
          <button onClick={onClose} className="hover:text-slate-700">Close</button>
        </div>
      </div>
    </div>
  );
}

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return <CommandPaletteModal onClose={onClose} />;
}