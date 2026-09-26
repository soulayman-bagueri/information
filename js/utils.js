// ============================================================
// INFORMATION - Utility Functions
// ============================================================

export function createId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}

export function now() {
    return Date.now();
}

export function formatDate(value) {
    if (!value) return "غير معروف";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "تاريخ غير صالح";
    }

    return new Intl.DateTimeFormat("ar-MA", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

export function formatShortDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("ar-MA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
}

export function formatFileSize(bytes = 0) {
    if (!bytes || bytes < 1) {
        return "0 B";
    }

    const units = ["B", "KB", "MB", "GB"];

    let size = Number(bytes);
    let index = 0;

    while (size >= 1024 && index < units.length - 1) {
        size /= 1024;
        index++;
    }

    return `${size.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

export function escapeHTML(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function normalizeText(value = "") {
    return String(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

export function containsText(value, query) {
    return normalizeText(value).includes(normalizeText(query));
}

export function getTags(value = "") {
    if (Array.isArray(value)) {
        return value
            .map(tag => String(tag).trim())
            .filter(Boolean);
    }

    return String(value)
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce(callback, delay = 300) {
    let timer = null;

    return (...args) => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            callback(...args);
        }, delay);
    };
}

export function throttle(callback, delay = 300) {
    let running = false;

    return (...args) => {
        if (running) return;

        running = true;

        callback(...args);

        setTimeout(() => {
            running = false;
        }, delay);
    };
}

export function isValidImage(file) {
    if (!file) return false;

    return typeof file.type === "string" &&
        file.type.startsWith("image/");
}

export function getImageType(file) {
    return file?.type || "image/*";
}

export function getFileExtension(filename = "") {
    const parts = String(filename).split(".");

    if (parts.length < 2) {
        return "";
    }

    return parts.pop().toLowerCase();
}

export function generateColor(text = "") {
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    const color = Math.abs(hash).toString(16).padStart(6, "0");

    return `#${color.slice(0, 6)}`;
}

export function safeJsonParse(value, fallback = null) {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

export function downloadBlob(blob, filename = "download") {
    if (!(blob instanceof Blob)) {
        throw new Error("البيانات ليست Blob صالحًا");
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

export function copyToClipboard(text) {
    if (!navigator.clipboard) {
        return Promise.reject(
            new Error("Clipboard API غير متاحة")
        );
    }

    return navigator.clipboard.writeText(String(text));
}

export function getElement(id) {
    return document.getElementById(id);
}

export function qs(selector, parent = document) {
    return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
}

export function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}