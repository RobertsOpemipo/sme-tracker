"use client";

import { useState, useTransition } from "react";
import { Product, Customer } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import { recordSale } from "@/app/actions/sales";
import { createCustomer } from "@/app/actions/customers";
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";

interface CartItem {
  product: Product;
  quantity: number;
}

export function POSTerminal({
  products,
  customers,
}: {
  products: Product[];
  customers: Customer[];
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "POS" | "CREDIT">("CASH");
  const [amountPaidInput, setAmountPaidInput] = useState<string>("");
  const [discountInput, setDiscountInput] = useState<string>("0");
  const [notes, setNotes] = useState<string>("");
  const [showNewCustomer, setShowNewCustomer] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Cart operations
  const addToCart = (product: Product) => {
    setStatusMessage(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.currentStock) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  const discount = Math.max(0, parseFloat(discountInput) || 0);
  const totalAmount = Math.max(0, subtotal - discount);

  // If user hasn't explicitly overridden amountPaid, default to totalAmount unless CREDIT
  const amountPaid =
    paymentMethod === "CREDIT"
      ? parseFloat(amountPaidInput) || 0
      : amountPaidInput === ""
      ? totalAmount
      : parseFloat(amountPaidInput) || 0;

  const balanceDue = Math.max(0, totalAmount - amountPaid);

  // Quick Customer Creation
  const handleQuickCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createCustomer(formData);
    if (res.success && res.customer) {
      setSelectedCustomerId(res.customer.id);
      setShowNewCustomer(false);
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to add customer" });
    }
  };

  // Submit Sale
  const handleCompleteSale = () => {
    setStatusMessage(null);
    if (cart.length === 0) {
      setStatusMessage({ type: "error", text: "Please add at least one product to the cart." });
      return;
    }

    if (balanceDue > 0 && !selectedCustomerId) {
      setStatusMessage({
        type: "error",
        text: "Please select or create a customer to record an unpaid debt / credit balance.",
      });
      return;
    }

    startTransition(async () => {
      const payload = {
        customerId: selectedCustomerId || null,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitCostPrice: item.product.costPrice,
          unitSellingPrice: item.product.sellingPrice,
        })),
        discount,
        amountPaid,
        paymentMethod,
        notes: notes || undefined,
      };

      const result = await recordSale(payload);
      if (result.success) {
        setStatusMessage({
          type: "success",
          text: `Sale recorded successfully! Receipt #${result.receiptNumber}`,
        });
        setCart([]);
        setAmountPaidInput("");
        setDiscountInput("0");
        setNotes("");
      } else {
        setStatusMessage({ type: "error", text: result.error || "Failed to complete sale" });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT: Product Catalog Selector (7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Available Catalog</h3>
          {products.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No products found in inventory. Add products first to begin selling.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
              {products.map((product) => {
                const inCart = cart.find((i) => i.product.id === product.id);
                const outOfStock = product.currentStock <= 0;

                return (
                  <button
                    key={product.id}
                    disabled={outOfStock}
                    onClick={() => addToCart(product)}
                    className={`p-3 text-left border rounded-xl transition flex flex-col justify-between ${
                      outOfStock
                        ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                        : "bg-white border-slate-200 hover:border-emerald-500 hover:shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 line-clamp-1">{product.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Stock: <span className="font-semibold text-slate-600">{product.currentStock}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-700 font-mono tabular-nums">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                      {inCart && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          {inCart.quantity} in cart
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Current Cart & Checkout (5 Cols) */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <ShoppingCart className="w-4 h-4 text-slate-600" />
            <span>Active Sale Receipt</span>
          </div>
          <span className="text-xs text-slate-400">{cart.length} unique items</span>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Cart Item List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Cart is currently empty.</div>
          ) : (
            cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs"
              >
                <div className="max-w-[150px]">
                  <div className="font-semibold text-slate-800 truncate">{product.name}</div>
                  <div className="text-slate-400 tabular-nums">
                    {formatCurrency(product.sellingPrice)} × {quantity}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-300 rounded bg-white">
                    <button
                      onClick={() => updateQuantity(product.id, -1)}
                      className="px-1.5 py-0.5 hover:bg-slate-100"
                    >
                      <Minus className="w-3 h-3 text-slate-600" />
                    </button>
                    <span className="px-2 font-semibold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, 1)}
                      className="px-1.5 py-0.5 hover:bg-slate-100"
                    >
                      <Plus className="w-3 h-3 text-slate-600" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer Assignment */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              Customer (Debtor Tracker)
            </label>
            <button
              type="button"
              onClick={() => setShowNewCustomer(!showNewCustomer)}
              className="text-[11px] font-semibold text-emerald-700 hover:underline"
            >
              {showNewCustomer ? "Select Existing" : "+ New Customer"}
            </button>
          </div>

          {showNewCustomer ? (
            <form onSubmit={handleQuickCustomer} className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200">
              <input
                required
                name="name"
                placeholder="Customer Full Name *"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
              />
              <input
                required
                name="phone"
                placeholder="Phone Number *"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
              >
                Save & Select Customer
              </button>
            </form>
          ) : (
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 bg-white"
            >
              <option value="">Walk-in Anonymous Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) {c.totalOwed > 0 ? `• Owes: ${formatCurrency(c.totalOwed)}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Payment & Split Configuration */}
        <div className="border-t border-slate-100 pt-3 space-y-3">
          <div className="grid grid-cols-4 gap-1">
            {(["CASH", "TRANSFER", "POS", "CREDIT"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                  paymentMethod === method
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-medium text-slate-500">Discount (₦)</label>
              <input
                type="number"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500">Amount Paid Now (₦)</label>
              <input
                type="number"
                value={amountPaidInput}
                placeholder={totalAmount.toString()}
                onChange={(e) => setAmountPaidInput(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Invoice Summary Tally */}
        <div className="bg-slate-50 p-3 rounded-lg space-y-1 text-xs border border-slate-200">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="tabular-nums font-mono">{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount</span>
              <span className="tabular-nums font-mono">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
            <span>Total Billable</span>
            <span className="tabular-nums font-mono">{formatCurrency(totalAmount)}</span>
          </div>

          {balanceDue > 0 && (
            <div className="flex justify-between text-xs font-bold text-rose-600 pt-1">
              <span>Unpaid Debt (Balance)</span>
              <span className="tabular-nums font-mono">{formatCurrency(balanceDue)}</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          disabled={isPending || cart.length === 0}
          onClick={handleCompleteSale}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete & Print Receipt"}
        </button>
      </div>
    </div>
  );
}