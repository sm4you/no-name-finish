import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "ج.م"): string {
  return `${amount.toLocaleString("ar-EG")} ${currency}`;
}

export function formatPriceEn(amount: number, currency = "EGP"): string {
  return `${amount.toLocaleString()} ${currency}`;
}
