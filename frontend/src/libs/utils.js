import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// gộp/ghi đè class taildwind ("p-2 p-4" -> "p-4")
export function cn(...args) {
    return twMerge(clsx(...args));
}

// Chuyển number thành tiền tệ USD
export function formatCurrencyUSD(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

export function formatDateVN(dateString) {
    if (!dateString) return 'Chưa chọn';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
};

