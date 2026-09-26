const DB_NAME = "information_private";
const DB_VERSION = 1;

let database = null;

export function openDatabase() {

    if (database) {
        return Promise.resolve(database);
    }

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = event => {

            const db = event.target.result;

            createStore(db, "notes");
            createStore(db, "folders");
            createStore(db, "images");
            createStore(db, "history");

        };

        request.onsuccess = event => {

            database = event.target.result;

            resolve(database);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}


function createStore(db, name) {

    if (!db.objectStoreNames.contains(name)) {

        const store = db.createObjectStore(
            name,
            {
                keyPath: "id"
            }
        );

        store.createIndex(
            "createdAt",
            "createdAt"
        );

        store.createIndex(
            "updatedAt",
            "updatedAt"
        );

        store.createIndex(
            "deleted",
            "deleted"
        );

    }

}


export async function add(storeName, data) {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                storeName,
                "readwrite"
            );

        transaction.objectStore(
            storeName
        ).add(data);

        transaction.oncomplete = () => {

            resolve(data);

        };

        transaction.onerror = () => {

            reject(transaction.error);

        };

    });

}


export async function put(storeName, data) {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                storeName,
                "readwrite"
            );

        transaction.objectStore(
            storeName
        ).put(data);

        transaction.oncomplete = () => {

            resolve(data);

        };

        transaction.onerror = () => {

            reject(transaction.error);

        };

    });

}


export async function get(storeName, id) {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                storeName,
                "readonly"
            );

        const request =
            transaction.objectStore(
                storeName
            ).get(id);

        request.onsuccess = () => {

            resolve(
                request.result || null
            );

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}


export async function getAll(storeName) {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                storeName,
                "readonly"
            );

        const request =
            transaction.objectStore(
                storeName
            ).getAll();

        request.onsuccess = () => {

            resolve(
                request.result || []
            );

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}


export async function remove(storeName, id) {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                storeName,
                "readwrite"
            );

        transaction.objectStore(
            storeName
        ).delete(id);

        transaction.oncomplete = () => {

            resolve(true);

        };

        transaction.onerror = () => {

            reject(transaction.error);

        };

    });

}


export function createId() {

    if (
        window.crypto &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );

}


export function timestamp() {

    return new Date().toISOString();

}


export function escapeHTML(value = "") {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


export function formatDate(value) {

    if (!value) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "ar-MA",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(
        new Date(value)
    );

}


export function formatFileSize(bytes = 0) {

    if (bytes < 1024) {

        return `${bytes} B`;

    }

    if (bytes < 1024 * 1024) {

        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;

    }

    return `${(
        bytes / (1024 * 1024)
    ).toFixed(1)} MB`;

}