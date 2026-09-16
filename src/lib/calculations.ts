export interface ProfitSummaryInput {
  revenue: number;
  cogs: number;
  operatingExpenses: number;
}

/**
 * Calculates Gross Profit (Revenue - Cost of Goods Sold)
 */
export function calculateGrossProfit(revenue: number, cogs: number): number {
  return revenue - cogs;
}

/**
 * Calculates Gross Margin Percentage: ((Gross Profit / Revenue) * 100)
 */
export function calculateGrossMargin(revenue: number, cogs: number): number {
  if (revenue <= 0) return 0;
  return ((revenue - cogs) / revenue) * 100;
}

/**
 * Calculates Net Profit (Revenue - COGS - Overhead Expenses)
 */
export function calculateNetProfit(input: ProfitSummaryInput): number {
  return input.revenue - (input.cogs + input.operatingExpenses);
}

/**
 * Evaluates payment status based on total invoice cost vs amount received
 */
export function resolvePaymentStatus(total: number, paid: number): "PAID" | "PARTIAL" | "UNPAID" {
  if (paid <= 0) return "UNPAID";
  if (paid >= total) return "PAID";
  return "PARTIAL";
}