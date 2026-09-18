// src/components/ui/ExportCsvButton.tsx
"use client";

import { useState } from "react";
import { Download, Check } from "lucide-react";
import { ToastNotification } from "@/components/ui/ToastNotification";

export function ExportCsvButton({
  url = "/api/export/sales",
  label = "Export CSV",
}: {
  url?: string;
  label?: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `sme_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setToastMessage("CSV ledger exported successfully!");
    } catch {
      alert("Failed to export ledger. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {toastMessage && (
        <ToastNotification
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="px-3 py-1.5 bg-brand-surface hover:bg-slate-200 border border-brand-border text-brand-ink text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
      >
        {downloading ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        ) : (
          <Download className="w-3.5 h-3.5 text-brand-muted" />
        )}
        <span>{downloading ? "Exporting..." : label}</span>
      </button>
    </>
  );
}