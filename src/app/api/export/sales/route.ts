// src/app/api/export/sales/route.ts
import { db } from "@/lib/db";

export async function GET() {
  const sales = await db.sale.findMany({
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV headers & content
  const headers = [
    "Receipt Number",
    "Date",
    "Customer",
    "Payment Method",
    "Payment Status",
    "Subtotal",
    "Discount",
    "Total Invoiced",
    "Amount Paid",
    "Debt Due",
    "Total COGS",
    "Gross Profit",
  ];

  const rows = sales.map((s) => {
    const cogs = s.items.reduce((acc, i) => acc + i.totalCostPrice, 0);
    const profit = s.items.reduce((acc, i) => acc + i.grossProfit, 0);

    return [
      `"${s.receiptNumber}"`,
      `"${new Date(s.createdAt).toISOString()}"`,
      `"${s.customer?.name || "Walk-In"}"`,
      `"${s.paymentMethod}"`,
      `"${s.paymentStatus}"`,
      s.subtotal,
      s.discount,
      s.totalAmount,
      s.amountPaid,
      s.balanceDue,
      cogs,
      profit,
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sme_sales_export_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}