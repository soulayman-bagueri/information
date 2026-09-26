// ============================================================
// INFORMATION - Favorites
// ============================================================

import {
    getAll,
    put
} from "./storage.js";

const FAVORITE_VALUE = true;

export async function getFavorites(storeName) {
    const items = await getAll(storeName);

    return items.filter(item => {
        return item.favorite === FAVORITE_VALUE &&
            !item.deleted;
    });
}

export async function isFavorite(storeName, id) {
    const items = await getAll(storeName);

    const item = items.find(entry => entry.id === id);

    return Boolean(item?.favorite);
}

export async function setFavorite(storeName, id, value = true) {
    const items = await getAll(storeName);

    const item = items.find(entry => entry.id === id);

    if (!item) {
        throw new Error("العنصر غير موجود");
    }

    item.favorite = Boolean(value);
    item.updatedAt = Date.now();

    await put(storeName, item);

    return item;
}

export async function toggleFavorite(storeName, id) {
    const items = await getAll(storeName);

    const item = items.find(entry => entry.id === id);

    if (!item) {
        throw new Error("العنصر غير موجود");
    }

    item.favorite = !Boolean(item.favorite);
    item.updatedAt = Date.now();

    await put(storeName, item);

    return item;
}

export async function countFavorites() {
    const stores = ["notes", "folders", "images"];

    let count = 0;

    for (const store of stores) {
        try {
            const favorites = await getFavorites(store);
            count += favorites.length;
        } catch {
            // المتجر قد لا يكون موجودًا
        }
    }

    return count;
}

export async function getAllFavorites() {
    const result = {
        notes: [],
        folders: [],
        images: []
    };

    for (const store of Object.keys(result)) {
        try {
            result[store] = await getFavorites(store);
        } catch {
            result[store] = [];
        }
    }

    return result;
}