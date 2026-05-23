import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupees */
export function formatRupee(amount: number | string, compact = false): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";

  if (compact) {
    if (num >= 10_000_000) return `₹${(num / 10_000_000).toFixed(2)} Cr`;
    if (num >= 100_000)    return `₹${(num / 100_000).toFixed(2)} L`;
    if (num >= 1_000)      return `₹${(num / 1_000).toFixed(1)} K`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Format date for display */
export function formatDate(
  date: string | Date,
  format: "short" | "medium" | "long" = "medium"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  const options: Intl.DateTimeFormatOptions =
    format === "short"
      ? { day: "numeric", month: "short" }
      : format === "medium"
      ? { day: "numeric", month: "short", year: "numeric" }
      : { weekday: "long", day: "numeric", month: "long", year: "numeric" };

  return d.toLocaleDateString("en-IN", options);
}

/** Get invoice status color */
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    paid: "text-emerald-700 bg-emerald-50 border-emerald-200",
    partial: "text-amber-700 bg-amber-50 border-amber-200",
    sent: "text-blue-700 bg-blue-50 border-blue-200",
    overdue: "text-red-700 bg-red-50 border-red-200",
    draft: "text-gray-600 bg-gray-50 border-gray-200",
    cancelled: "text-gray-400 bg-gray-50 border-gray-200",
  };
  return map[status] ?? map.draft;
}

/** Capitalize first letter */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

/** Validate GSTIN */
export function isValidGSTIN(gstin: string): boolean {
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin.toUpperCase());
}

/** Generate invoice number */
export function generateInvoiceNumber(prefix: string, sequence: number): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  return `${prefix}-${year}${month}-${String(sequence).padStart(4, "0")}`;
}
