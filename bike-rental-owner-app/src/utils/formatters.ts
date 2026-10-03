import dayjs from "dayjs";

export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("DD MMM YYYY");
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("DD MMM YYYY, hh:mm A");
}

export function formatTime(timeStr?: string | null): string {
  if (!timeStr) return "-";
  if (timeStr.length === 5) {
    return dayjs(`2000-01-01T${timeStr}:00`).format("hh:mm A");
  }
  return dayjs(`2000-01-01T${timeStr}`).format("hh:mm A");
}

export function maskAccountNumber(acc?: string): string {
  if (!acc) return "•••• •••• ••••";
  if (acc.length <= 4) return acc;
  return `•••• •••• ${acc.slice(-4)}`;
}

export function maskAadhaar(aadhaar?: string): string {
  if (!aadhaar) return "•••• •••• ••••";
  const clean = aadhaar.replace(/\s+/g, "");
  if (clean.length <= 4) return clean;
  return `•••• •••• ${clean.slice(-4)}`;
}
