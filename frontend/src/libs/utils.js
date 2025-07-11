import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// gộp/ghi đè class taildwind ("p-2 p-4" -> "p-4")
export function cn(...args) {
    return twMerge(clsx(...args));
}

// chuyển number thành tiền tệ
export function formatCurrencyVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}