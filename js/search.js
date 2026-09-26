// ============================================================
// INFORMATION - Search
// ============================================================

import {
    getAll
} from "./storage.js";

function normalize(value = "") {
    return String(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function matches(item, query) {
    const q = normalize(query);

    if (!q) return true;

    const fields = [
        item.title,
        item.name,
        item.content,
        item.description,
        item.folder,
        item.folderName,
        item.type,
        item.mimeType
    ];

    if (Array.isArray(item.tags)) {
        fields.push(...item.tags);
    }

    return fields.some(value => {
        return normalize(value || "").includes(q);
    });
}

export async function searchNotes(query) {
    const notes = await getAll("notes");

    return notes.filter(note => {
        return !note.deleted && matches(note, query);
    });
}

export async function searchFolders(query) {
    const folders = await getAll("folders");

    return folders.filter(folder => {
        return !folder.deleted && matches(folder, query);
    });
}

export async function searchImages(query) {
    const images = await getAll("images");

    return images.filter(image => {
        return !image.deleted && matches(image, query);
    });
}

export async function searchEverything(query) {
    const [
        notes,
        folders,
        images
    ] = await Promise.all([
        searchNotes(query),
        searchFolders(query),
        searchImages(query)
    ]);

    return {
        query,
        notes,
        folders,
        images,
        total:
            notes.length +
            folders.length +
            images.length
    };
}

export async function globalSearch(query) {
    if (!String(query || "").trim()) {
        return {
            query: "",
            notes: [],
            folders: [],
            images: [],
            total: 0
        };
    }

    return await searchEverything(query);
}

export function clearSearch(input) {
    if (input) {
        input.value = "";
        input.dispatchEvent(
            new Event("input", {
                bubbles: true
            })
        );
    }
}