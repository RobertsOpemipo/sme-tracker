// src/app/not-found.tsx
import Link from "next/link";
import { Store, Receipt, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
        {/* Animated Badge Icon */}
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
          <Receipt className="w-8 h-8 text-emerald-400 stroke-[1.5]" />
        </div>

        <div className="space-y-2">
          <div className="inline-block bg-rose-100 text-rose-700 font-bold px-3 py-1 rounded-full text-xs font-mono">
            Error 404
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Receipt Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The transaction or receipt you are looking for does not exist, may have been removed, or the link is invalid.
          </p>
        </div>

        {/* Action Recovery Links */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/dashboard/sales/history"
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sales History</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Dashboard Overview</span>
          </Link>
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Store className="w-3.5 h-3.5 text-slate-400" />
          <span>Apex Retail SME OS</span>
        </div>
      </div>
    </div>
  );
}