const DB_NAME = "InformationDB";
const DB_VERSION = 2;

const STORES = {
    folders: "folders",
    notes: "notes",
    images: "images",
    history: "history"
};

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = event => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORES.folders)) {
                const store = db.createObjectStore(STORES.folders, {
                    keyPath: "id"
                });

                store.createIndex("parentId", "parentId", {
                    unique: false
                });

                store.createIndex("deleted", "deleted", {
                    unique: false
                });
            }

            if (!db.objectStoreNames.contains(STORES.notes)) {
                const store = db.createObjectStore(STORES.notes, {
                    keyPath: "id"
                });

                store.createIndex("folderId", "folderId", {
                    unique: false
                });

                store.createIndex("deleted", "deleted", {
                    unique: false
                });

                store.createIndex("favorite", "favorite", {
                    unique: false
                });
            }

            if (!db.objectStoreNames.contains(STORES.images)) {
                const store = db.createObjectStore(STORES.images, {
                    keyPath: "id"
                });

                store.createIndex("folderId", "folderId", {
                    unique: false
                });

                store.createIndex("deleted", "deleted", {
                    unique: false
                });

                store.createIndex("favorite", "favorite", {
                    unique: false
                });
            }

            if (!db.objectStoreNames.contains(STORES.history)) {
                db.createObjectStore(STORES.history, {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

function generateId(prefix = "item") {
    return `${prefix}_${Date.now()}_${crypto.randomUUID()}`;
}

async function dbAdd(storeName, data) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);

        const request = store.add(data);

        request.onsuccess = () => resolve(data);
        request.onerror = () => reject(request.error);
    });
}

async function dbPut(storeName, data) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);

        const request = store.put(data);

        request.onsuccess = () => resolve(data);
        request.onerror = () => reject(request.error);
    });
}

async function dbGet(storeName, id) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const request = tx.objectStore(storeName).get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function dbGetAll(storeName) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const request = tx.objectStore(storeName).getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function dbDelete(storeName, id) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const request = tx.objectStore(storeName).delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

async function addHistory(action, type, itemId, details = {}) {
    return dbAdd(STORES.history, {
        id: generateId("history"),
        action,
        type,
        itemId,
        details,
        createdAt: Date.now()
    });
}