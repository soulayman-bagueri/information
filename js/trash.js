// ============================================================
// INFORMATION - Trash
// ============================================================

import {
    getAll,
    put,
    remove
} from "./storage.js";

const STORES = [
    "notes",
    "folders",
    "images"
];

export async function moveToTrash(storeName, id) {
    const items = await getAll(storeName);

    const item = items.find(entry => entry.id === id);

    if (!item) {
        throw new Error("العنصر غير موجود");
    }

    item.deleted = true;
    item.deletedAt = Date.now();
    item.updatedAt = Date.now();

    await put(storeName, item);

    return item;
}

export async function restoreFromTrash(storeName, id) {
    const items = await getAll(storeName);

    const item = items.find(entry => entry.id === id);

    if (!item) {
        throw new Error("العنصر غير موجود");
    }

    item.deleted = false;
    item.deletedAt = null;
    item.updatedAt = Date.now();

    await put(storeName, item);

    return item;
}

export async function permanentlyDelete(storeName, id) {
    await remove(storeName, id);

    return true;
}

export async function getTrash(storeName = null) {
    if (storeName) {
        const items = await getAll(storeName);

        return items
            .filter(item => item.deleted)
            .sort((a, b) => {
                return Number(b.deletedAt || 0) -
                    Number(a.deletedAt || 0);
            });
    }

    const result = [];

    for (const store of STORES) {
        try {
            const items = await getAll(store);

            for (const item of items) {
                if (item.deleted) {
                    result.push({
                        ...item,
                        storeName: store
                    });
                }
            }
        } catch {
            // تجاهل المتجر غير الموجود
        }
    }

    return result.sort((a, b) => {
        return Number(b.deletedAt || 0) -
            Number(a.deletedAt || 0);
    });
}

export async function countTrash() {
    const items = await getTrash();

    return items.length;
}

export async function emptyTrash() {
    const items = await getTrash();

    for (const item of items) {
        await remove(item.storeName, item.id);
    }

    return items.length;
}