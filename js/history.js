// ============================================================
// INFORMATION - History
// ============================================================

import {
    add,
    getAll,
    remove
} from "./storage.js";

const STORE = "history";

export async function addHistory({
    action = "unknown",
    type = "system",
    itemId = null,
    title = "",
    details = ""
} = {}) {
    const entry = {
        id: `history_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`,

        action,
        type,
        itemId,
        title,
        details,

        createdAt: Date.now()
    };

    return await add(STORE, entry);
}

export async function getHistory(limit = 100) {
    const entries = await getAll(STORE);

    return entries
        .sort((a, b) => {
            return Number(b.createdAt || 0) -
                Number(a.createdAt || 0);
        })
        .slice(0, limit);
}

export async function clearHistory() {
    const entries = await getAll(STORE);

    for (const entry of entries) {
        await remove(STORE, entry.id);
    }

    return true;
}

export async function removeHistory(id) {
    await remove(STORE, id);
}

export function historyLabel(action) {
    const labels = {
        create: "إنشاء",
        update: "تعديل",
        delete: "حذف",
        restore: "استعادة",
        favorite: "مفضلة",
        unfavorite: "إزالة من المفضلة",
        upload: "رفع",
        open: "فتح",
        search: "بحث",
        login: "تسجيل الدخول",
        logout: "تسجيل الخروج"
    };

    return labels[action] || action;
}

export function historyIcon(action) {
    const icons = {
        create: "＋",
        update: "✎",
        delete: "⌫",
        restore: "↶",
        favorite: "★",
        unfavorite: "☆",
        upload: "↑",
        open: "◉",
        search: "⌕",
        login: "→",
        logout: "←"
    };

    return icons[action] || "•";
}