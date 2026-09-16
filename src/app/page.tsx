// src/app/page.tsx
import Link from "next/link";
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-8">
      <header className="flex items-center justify-between max-w-6xl mx-auto w-full py-4">
        <div className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center font-black text-slate-950">
            S
          </div>
          Apex SME
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-slate-300 hover:text-white">Sign In</Link>
          <Link 
            href="/dashboard" 
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg font-semibold transition"
          >
            Launch Demo
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full text-center py-20">
        <span className="text-emerald-400 font-semibold text-xs uppercase tracking-wider bg-emerald-950/70 border border-emerald-800/80 px-3 py-1 rounded-full">
          Profit Intelligence & Debt Tracking
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-6 leading-tight">
          Know your real profit, not just your revenue.
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mt-4">
          Accurate COGS tracking, FIFO margin protection, and customer debt recovery built specifically for modern retail and SME businesses.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-lg font-bold transition shadow-lg shadow-emerald-950"
          >
            Enter Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-600 py-4">
        © 2026 Apex SME Platform. All rights reserved.
      </footer>
    </div>
  );
}