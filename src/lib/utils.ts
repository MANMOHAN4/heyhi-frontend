import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function formatDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

/*
 * The backend calls this `amount_cents`, but for INR the documented
 * smallest currency unit is paise. Divide by 100 before displaying.
 */
export function formatCurrency(
  amountSmallestUnit: number,
  currency = "INR",
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountSmallestUnit / 100);
}

export function initials(value: string): string {
  const parts = value
    .split(/[\s@._-]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  const result = parts.map((part) => part.charAt(0).toUpperCase()).join("");

  return result || "U";
}

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function isFileSourceUrl(url: string): boolean {
  return url.startsWith("file://");
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}
