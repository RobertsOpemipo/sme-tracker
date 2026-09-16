// src/components/pos/PosRegister.tsx
"use client";

import { useState, useTransition, useMemo } from "react";
import { Product, Customer, Category } from "@prisma/client";
import { processSale, CartItem, CheckoutPayload } from "@/app/actions/pos";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  X,
  Loader2,
  Tag,
  Package,
  Layers,
  FileText,
  BadgeAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type ProductWithCategory = Product & {
  categoryRel?: Category | null;
};

export interface PosRegisterProps {
  products: ProductWithCategory[];
  customers: Customer[];
  categories?: Category[];
}

export function PosRegister({
  products,
  customers,
  categories = [],
}: PosRegisterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Checkout workflow state
  const [customerMode, setCustomerMode] = useState<"WALK_IN" | "REGISTERED">("WALK_IN");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "POS">("CASH");
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [discountInput, setDiscountInput] = useState<string>("0");
  const [amountPaidInput, setAmountPaidInput] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [showAdditionalMeta, setShowAdditionalMeta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Search & category filtering
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term)) ||
        (p.barcode && p.barcode.toLowerCase().includes(term));

      const matchesCat =
        selectedCategory === "ALL" ||
        p.categoryId === selectedCategory ||
        p.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory, products]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) return prev;
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          costPrice: product.costPrice,
          sellingPrice: product.sellingPrice,
          quantity: 1,
          maxStock: product.currentStock,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.maxStock) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomerId("");
    setCustomerMode("WALK_IN");
    setIsCreditSale(false);
    setDiscountInput("0");
    setAmountPaidInput("");
    setNotes("");
    setShowAdditionalMeta(false);
    setError(null);
  };

  // Calculations
  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0),
    [cart]
  );
  const totalUnits = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );
  const discount = Math.min(subtotal, Math.max(0, parseFloat(discountInput) || 0));
  const totalAmount = Math.max(0, subtotal - discount);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const numericPaid = isCreditSale ? parseFloat(amountPaidInput) || 0 : totalAmount;
  const remainingDebt = Math.max(0, totalAmount - numericPaid);

  const handleFinalizeSale = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError("Please add at least one item to cart.");
      return;
    }

    if (isCreditSale && remainingDebt > 0 && (!selectedCustomerId || customerMode !== "REGISTERED")) {
      setError("Select a registered customer account to allocate debt balance.");
      return;
    }

    const payload: CheckoutPayload = {
      items: cart,
      customerId: customerMode === "REGISTERED" && selectedCustomerId ? selectedCustomerId : null,
      subtotal,
      discount,
      totalAmount,
      amountPaid: isCreditSale ? numericPaid : totalAmount,
      paymentMethod,
      notes,
    };

    startTransition(async () => {
      const result = await processSale(payload);
      if (result.success && result.receiptNumber) {
        setLastReceipt(result.receiptNumber);
        clearCart();
      } else {
        setError(result.error || "Transaction failed");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-auto lg:h-[calc(100vh-9.5rem)] overflow-visible lg:overflow-hidden select-none">
      {/* ---------------------------------------------------- */}
      {/* LEFT: Product Catalog Deck (7 cols)                  */}
      {/* ---------------------------------------------------- */}
      <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-brand-card border border-brand-border rounded-2xl shadow-2xs">
        {/* Fixed Header Bar */}
        <div className="p-3.5 border-b border-brand-border shrink-0 space-y-2.5 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, SKU, or scan barcode..."
              className="w-full bg-brand-surface border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs text-brand-ink placeholder:text-brand-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-ink/10 focus:border-brand-ink transition"
            />
          </div>

          {/* Horizontal Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedCategory === "ALL"
                  ? "bg-brand-ink text-white shadow-2xs"
                  : "bg-brand-surface text-brand-muted hover:text-brand-ink border border-brand-border/60"
              }`}
            >
              <Layers className="w-3 h-3" />
              All ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] whitespace-nowrap transition border ${
                  selectedCategory === cat.id
                    ? "bg-brand-ink text-white border-brand-ink shadow-2xs"
                    : "bg-brand-surface text-brand-muted hover:text-brand-ink border-brand-border/60"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dedicated Scroll Container for Product Tiles */}
        <div className="flex-1 overflow-y-auto p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 content-start">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <Package className="w-8 h-8 mx-auto text-brand-muted/50 mb-2" />
              <div className="text-xs font-bold text-brand-ink">No items found</div>
              <p className="text-[11px] text-brand-muted mt-0.5">Try altering the search phrase or category</p>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isOutOfStock = p.currentStock <= 0;
              const inCart = cart.find((i) => i.productId === p.id);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  disabled={isOutOfStock}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition group relative ${
                    isOutOfStock
                      ? "opacity-40 border-brand-border bg-brand-surface cursor-not-allowed"
                      : inCart
                      ? "border-brand-ink bg-brand-surface ring-1 ring-brand-ink/10 shadow-xs"
                      : "border-brand-border bg-white hover:border-slate-300 hover:shadow-2xs active:scale-[0.98]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[10px] text-brand-muted">
                      <span className="truncate">{p.categoryRel?.name || p.category || "General"}</span>
                      {p.sku && <span className="font-mono">{p.sku}</span>}
                    </div>
                    <div className="text-xs font-bold text-brand-ink leading-snug mt-1 line-clamp-2">
                      {p.name}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-brand-border/60 flex items-center justify-between">
                    <span className="font-mono font-black text-brand-ink text-xs sm:text-sm">
                      {formatCurrency(p.sellingPrice)}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isOutOfStock
                          ? "bg-fintech-rose-light text-fintech-rose border border-fintech-rose-border"
                          : p.currentStock <= p.minStockAlert
                          ? "bg-fintech-amber-light text-amber-800 border border-fintech-amber-border"
                          : "bg-fintech-mint-light text-emerald-800 border border-fintech-mint-border"
                      }`}
                    >
                      {p.currentStock} left
                    </span>
                  </div>

                  {inCart && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-ink text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {inCart.quantity}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* RIGHT: Active Till & Terminal Dock (5 cols)          */}
      {/* ---------------------------------------------------- */}
      <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-brand-card border border-brand-border rounded-2xl shadow-2xs">
        <form onSubmit={handleFinalizeSale} className="flex flex-col h-full overflow-hidden">
          {/* Customer Type Bar */}
          <div className="p-3 border-b border-brand-border bg-brand-surface/70 shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                Active Till
              </span>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] font-bold text-fintech-rose hover:underline"
                >
                  Clear Register
                </button>
              )}
            </div>

            {/* Account Toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/60 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setCustomerMode("WALK_IN");
                  setSelectedCustomerId("");
                  setIsCreditSale(false);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  customerMode === "WALK_IN"
                    ? "bg-white text-brand-ink shadow-2xs"
                    : "text-brand-muted hover:text-brand-ink"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Walk-In
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode("REGISTERED")}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  customerMode === "REGISTERED"
                    ? "bg-white text-brand-ink shadow-2xs"
                    : "text-brand-muted hover:text-brand-ink"
                }`}
              >
                <BadgeAlert className="w-3.5 h-3.5 text-amber-600" />
                Debtor Account
              </button>
            </div>

            {/* Debtor Select */}
            {customerMode === "REGISTERED" && (
              <div className="pt-0.5 animate-in fade-in duration-100">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-brand-border rounded-xl px-2.5 py-1.5 text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-ink cursor-pointer"
                >
                  <option value="">-- Choose Debtor Profile --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) {c.totalOwed > 0 ? `• Owes ${formatCurrency(c.totalOwed)}` : "• Clean"}
                    </option>
                  ))}
                </select>

                {selectedCustomer && (
                  <div className="mt-1 flex items-center justify-between text-[10px] px-0.5">
                    <span className="text-brand-muted">Ledger Exposure:</span>
                    <span className={selectedCustomer.totalOwed > 0 ? "text-fintech-rose font-bold" : "text-fintech-mint font-bold"}>
                      {selectedCustomer.totalOwed > 0 ? `Carrying ${formatCurrency(selectedCustomer.totalOwed)}` : "Balance Clear"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scrollable Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 divide-y divide-brand-border/60">
            {cart.length === 0 ? (
              <div className="h-full py-12 flex flex-col items-center justify-center text-brand-muted">
                <ShoppingCart className="w-8 h-8 stroke-[1.25] text-brand-muted/40 mb-1.5" />
                <div className="text-xs font-bold text-brand-ink">Till is empty</div>
                <p className="text-[10px] text-brand-muted">Tap products from the catalog to ring up</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2.5 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-brand-ink truncate leading-tight">{item.name}</div>
                    <div className="text-[10px] text-brand-muted font-mono mt-0.5">
                      {formatCurrency(item.sellingPrice)} × {item.quantity}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-brand-surface p-0.5 rounded-lg border border-brand-border/60">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-5 h-5 rounded bg-white shadow-2xs hover:bg-slate-50 flex items-center justify-center text-brand-ink"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-brand-ink w-5 text-center text-xs">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="w-5 h-5 rounded bg-white shadow-2xs hover:bg-slate-50 flex items-center justify-center text-brand-ink disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right font-mono font-black text-brand-ink min-w-[65px] text-xs">
                    {formatCurrency(item.sellingPrice * item.quantity)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-slate-300 hover:text-fintech-rose rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Bottom Controls / Settlement Panel */}
          <div className="p-3.5 bg-brand-surface border-t border-brand-border shrink-0 space-y-2.5">
            {error && (
              <div className="p-2 bg-fintech-rose-light text-fintech-rose border border-fintech-rose-border rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            {/* Tender Method Selector */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
                Tender Type
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === "CASH"
                      ? "border-brand-ink bg-brand-ink text-white shadow-2xs"
                      : "border-brand-border bg-white hover:bg-slate-50 text-brand-muted"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" /> Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("TRANSFER")}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === "TRANSFER"
                      ? "border-brand-ink bg-brand-ink text-white shadow-2xs"
                      : "border-brand-border bg-white hover:bg-slate-50 text-brand-muted"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("POS")}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === "POS"
                      ? "border-brand-ink bg-brand-ink text-white shadow-2xs"
                      : "border-brand-border bg-white hover:bg-slate-50 text-brand-muted"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> POS Card
                </button>
              </div>
            </div>

            {/* Credit Allocation Checkbox (Registered Accounts Only) */}
            {customerMode === "REGISTERED" && (
              <div className="p-2.5 bg-fintech-amber-light border border-fintech-amber-border rounded-xl space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCreditSale}
                    onChange={(e) => {
                      setIsCreditSale(e.target.checked);
                      if (e.target.checked) setAmountPaidInput("0");
                    }}
                    className="w-3.5 h-3.5 rounded text-brand-ink border-brand-border focus:ring-0"
                  />
                  <span className="text-xs font-bold text-amber-950">Sell on Credit / Partial</span>
                </label>

                {isCreditSale && (
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div>
                      <label className="text-[9px] font-bold text-amber-900 uppercase">Paid Now (₦)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amountPaidInput}
                        onChange={(e) => setAmountPaidInput(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-brand-ink focus:outline-none"
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-fintech-rose uppercase block">Add to Debt</span>
                      <span className="text-xs font-mono font-black text-fintech-rose block mt-1">
                        {formatCurrency(remainingDebt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Collapsible Meta (Discount / Slip Ref) */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdditionalMeta(!showAdditionalMeta)}
                className="text-[11px] font-semibold text-brand-muted hover:text-brand-ink flex items-center gap-1 transition"
              >
                {showAdditionalMeta ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showAdditionalMeta ? "Hide discount & reference notes" : "+ Add Discount or Memo Slip"}
              </button>

              {showAdditionalMeta && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 animate-in fade-in duration-100">
                  <div>
                    <label className="text-[9px] font-bold text-brand-muted uppercase flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Discount (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value)}
                      className="w-full mt-1 bg-white border border-brand-border rounded-lg px-2 py-1 font-mono text-xs font-bold text-brand-ink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-brand-muted uppercase flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Memo Ref
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. POS Ref #99"
                      className="w-full mt-1 bg-white border border-brand-border rounded-lg px-2 py-1 text-xs text-brand-ink focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Total Balance & Submit Action */}
            <div className="pt-2 border-t border-brand-border flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-brand-muted block">Total Due ({totalUnits} units)</span>
                {discount > 0 && (
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    - {formatCurrency(discount)} discount
                  </span>
                )}
              </div>
              <span className="font-mono font-black text-lg text-brand-ink">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <button
              type="submit"
              disabled={cart.length === 0 || isPending}
              className="w-full py-2.5 px-4 bg-brand-ink hover:bg-slate-800 text-white rounded-xl text-xs font-black tracking-wide shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>
                  {isCreditSale
                    ? `Record Credit (${formatCurrency(remainingDebt)})`
                    : `Charge ${formatCurrency(totalAmount)}`}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Toast Notification                                  */}
      {/* ---------------------------------------------------- */}
      {lastReceipt && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-ink text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-fintech-mint shrink-0" />
          <div className="text-xs">
            <div className="font-bold">Transaction Successfully Completed</div>
            <div className="text-slate-400 font-mono text-[11px] mt-0.5">Receipt: {lastReceipt}</div>
          </div>
          <button
            type="button"
            onClick={() => setLastReceipt(null)}
            className="ml-2 text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}