// src/components/layout/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  Store, 
  Settings, 
  LogOut, 
  Command, 
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { CommandPalette } from "@/components/layout/CommandPalette";

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Trigger Search Palette */}
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl pl-3.5 pr-3 py-2 text-xs text-left text-slate-400 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Quick search inventory, debtors, receipts...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-500 shadow-2xs">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Status, Notifications, Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terminal Online</span>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-600">
                    2 alerts
                  </span>
                </div>
                <div className="divide-y divide-slate-100 text-xs mt-2">
                  <div className="py-2.5 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">Low Stock Alert</div>
                      <div className="text-[11px] text-slate-500">Items have fallen below minimum thresholds.</div>
                    </div>
                  </div>
                  <div className="py-2.5 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">Debt Settle Received</div>
                      <div className="text-[11px] text-slate-500">Customer balance cleared via Transfer.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                AR
              </div>
              <div className="hidden sm:block text-left leading-tight pr-1">
                <div className="text-xs font-bold text-slate-900">Apex Retailers</div>
                <div className="text-[10px] text-slate-400 font-medium">Store Admin</div>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900">Apex Retailers</div>
                  <div className="text-[11px] text-slate-400">admin@apex.local</div>
                </div>
                <div className="p-1">
                  <Link
                    href="/dashboard/inventory"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Store className="w-3.5 h-3.5 text-slate-400" />
                    Store Inventory
                  </Link>
                  <Link
                    href="/dashboard/analytics"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    Operating Reports
                  </Link>
                </div>
                <div className="p-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Lock Register
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}