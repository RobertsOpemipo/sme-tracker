// src/components/layout/Sidebar.tsx
"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  BarChart3,
  Scale,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";

// Full desktop navigation deck
const DESKTOP_NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "POS Terminal", href: "/dashboard/sales", icon: ShoppingCart },
  { name: "Debtors", href: "/dashboard/customers", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Daily Z-Report", href: "/dashboard/reconciliation", icon: Scale },
  { name: "Expenses", href: "/dashboard/expenses", icon: Wallet },
];

// Curated 5 items for the mobile bottom bar to prevent cramping
const MOBILE_NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS", href: "/dashboard/sales", icon: ShoppingCart },
  { name: "Stock", href: "/dashboard/inventory", icon: Package },
  { name: "Debtors", href: "/dashboard/customers", icon: Users },
  { name: "Z-Report", href: "/dashboard/reconciliation", icon: Scale },
];

const STORAGE_KEY = "sme_sidebar_collapsed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true";
}

function getServerSnapshot(): boolean {
  return false;
}

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleSidebar = () => {
    const nextState = !collapsed;
    localStorage.setItem(STORAGE_KEY, String(nextState));
    window.dispatchEvent(new Event("storage"));
  };

  const isItemActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/dashboard/sales") return pathname === "/dashboard/sales";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* 1. MOBILE BOTTOM APP BAR (Phones & Handhelds)        */}
      {/* ---------------------------------------------------- */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1.5 flex items-center justify-around shadow-lg safe-bottom">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition text-[10px] font-semibold gap-1 min-w-[50px] ${
                isActive
                  ? "text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-500"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ---------------------------------------------------- */}
      {/* 2. DESKTOP RETRACTABLE SIDEBAR (>= md screens)       */}
      {/* ---------------------------------------------------- */}
      <aside
        className={`relative bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col min-h-screen transition-all duration-200 ease-in-out select-none ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Retract / Expand Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-7 z-30 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center shadow-xs transition"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center gap-3 overflow-hidden shrink-0">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Store className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight min-w-0">
              <h1 className="font-bold text-sm text-slate-900 truncate">Apex Retail</h1>
              <span className="text-[11px] text-slate-400 font-medium truncate block">
                SME Manager
              </span>
            </div>
          )}
        </div>

        {/* Navigation Link Deck */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {DESKTOP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 py-2.5 rounded-xl text-xs font-semibold transition group relative ${
                  collapsed ? "justify-center px-0" : "px-3"
                } ${
                  isActive
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
                  }`}
                />

                {!collapsed && <span className="truncate">{item.name}</span>}

                {/* Flyout Tooltip on Hover in Collapsed Mode */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Admin Node */}
        <div className="p-3 border-t border-slate-100 shrink-0 overflow-hidden">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200/60 ${
              collapsed ? "justify-center p-2" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              AR
            </div>
            {!collapsed && (
              <div className="min-w-0 text-left leading-tight">
                <div className="text-xs font-bold text-slate-800 truncate">Store Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@apex.local</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}