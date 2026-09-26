import {
    getAll,
    get,
    put,
    remove,
    createId,
    timestamp,
    escapeHTML,
    formatDate,
    formatFileSize
} from "./storage.js";


const SESSION_KEY =
    "information_authenticated";


if (
    sessionStorage.getItem(
        SESSION_KEY
    ) !== "true"
) {

    window.location.replace(
        "index.html"
    );

}


/* -------------------------
   STATE
------------------------- */

const state = {

    currentPage: "home",

    editingNote: null,

    currentFolder: null,

    searchTimer: null

};


/* -------------------------
   ELEMENTS
------------------------- */

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    [...document.querySelectorAll(selector)];


/* -------------------------
   INITIALIZE
------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupEvents();

        loadTheme();

        updateDate();

        await initializeDatabase();

        await renderAll();

    }
);


/* -------------------------
   DATABASE INIT
------------------------- */

async function initializeDatabase() {

    const folders =
        await getAll("folders");

    if (folders.length === 0) {

        await put(
            "folders",
            {
                id: createId(),

                name: "شخصي",

                parentId: null,

                deleted: false,

                createdAt: timestamp(),

                updatedAt: timestamp()
            }
        );

    }

}


/* -------------------------
   EVENTS
------------------------- */

function setupEvents() {

    $$("[data-page]").forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showPage(
                        button.dataset.page
                    );

                }
            );

        }
    );


    $("#newNoteButton")
        .addEventListener(
            "click",
            () => openNoteModal()
        );


    $("#notesAddButton")
        .addEventListener(
            "click",
            () => openNoteModal()
        );


    $("#newFolderButton")
        .addEventListener(
            "click",
            () => openFolderModal()
        );


    $("#foldersAddButton")
        .addEventListener(
            "click",
            () => openFolderModal()
        );


    $("#noteForm")
        .addEventListener(
            "submit",
            saveNote
        );


    $("#folderForm")
        .addEventListener(
            "submit",
            saveFolder
        );


    $("#imageInput")
        .addEventListener(
            "change",
            uploadImages
        );


    $("#searchInput")
        .addEventListener(
            "input",
            handleSearch
        );


    $("#themeButton")
        .addEventListener(
            "click",
            toggleTheme
        );


    $("#logoutButton")
        .addEventListener(
            "click",
            logout
        );


    $("#emptyTrashButton")
        .addEventListener(
            "click",
            emptyTrash
        );


    $$("[data-close]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        closeModal(
                            button.dataset.close
                        );

                    }
                );

            }
        );


    $$(".modal")
        .forEach(
            modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target === modal
                        ) {

                            closeModal(
                                modal.id
                            );

                        }

                    }
                );

            }
        );

}


/* -------------------------
   PAGES
------------------------- */

function showPage(page) {

    state.currentPage = page;

    const pages = [
        "home",
        "notes",
        "folders",
        "images",
        "favorites",
        "trash",
        "history",
        "search"
    ];

    pages.forEach(
        name => {

            const element =
                $(`#${name}Page`);

            if (!element) return;

            element.classList.toggle(
                "hidden",
                name !== page
            );

        }
    );


    $$(".nav-item[data-page]")
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.page === page
                );

            }
        );


    const titles = {

        home: "الرئيسية",
        notes: "المعلومات",
        folders: "المجلدات",
        images: "الصور",
        favorites: "المفضلة",
        trash: "سلة المهملات",
        history: "السجل",
        search: "البحث"

    };


    $("#pageTitle").textContent =
        titles[page] || "Information";

}


/* -------------------------
   RENDER ALL
------------------------- */

async function renderAll() {

    await renderStats();

    await renderRecentNotes();

    await renderNotes();

    await renderFolders();

    await renderImages();

    await renderFavorites();

    await renderTrash();

    await renderHistory();

}


/* -------------------------
   STATS
------------------------- */

async function renderStats() {

    const [
        folders,
        notes,
        images
    ] = await Promise.all([
        getAll("folders"),
        getAll("notes"),
        getAll("images")
    ]);


    const activeFolders =
        folders.filter(
            folder => !folder.deleted
        );

    const activeNotes =
        notes.filter(
            note => !note.deleted
        );

    const activeImages =
        images.filter(
            image => !image.deleted
        );


    const favorites =
        [
            ...activeNotes,
            ...activeImages
        ].filter(
            item => item.favorite
        );


    $("#foldersCount").textContent =
        activeFolders.length;

    $("#notesCount").textContent =
        activeNotes.length;

    $("#imagesCount").textContent =
        activeImages.length;

    $("#favoritesCount").textContent =
        favorites.length;

}


/* -------------------------
   NOTES
------------------------- */

async function renderNotes() {

    const notes =
        await getAll("notes");


    const active =
        notes
            .filter(
                note => !note.deleted
            )
            .sort(
                (a,b) =>
                    new Date(b.updatedAt) -
                    new Date(a.updatedAt)
            );


    renderNoteList(
        $("#notesGrid"),
        active
    );

}


async function renderRecentNotes() {

    const notes =
        await getAll("notes");


    const recent =
        notes
            .filter(
                note => !note.deleted
            )
            .sort(
                (a,b) =>
                    new Date(b.updatedAt) -
                    new Date(a.updatedAt)
            )
            .slice(0,6);


    renderNoteList(
        $("#recentNotes"),
        recent
    );

}


function renderNoteList(
    container,
    notes
) {

    if (!notes.length) {

        container.innerHTML = `
            <div class="empty">
                لا توجد معلومات بعد.
                <br>
                أضف أول معلومة من زر «معلومة جديدة».
            </div>
        `;

        return;

    }


    container.innerHTML =
        notes
            .map(
                createNoteHTML
            )
            .join("");


    bindNoteButtons(
        container
    );

}


function createNoteHTML(note) {

    const tags =
        (note.tags || [])
            .map(
                tag =>
                    `<span class="badge">
                        #${escapeHTML(tag)}
                    </span>`
            )
            .join("");


    return `
        <article
            class="info-card"
            data-note-id="${note.id}"
        >

            <h3>
                ${escapeHTML(note.title)}
            </h3>

            <div class="info-card-content">
                ${escapeHTML(note.content)}
            </div>

            <div class="card-date">
                ${formatDate(note.updatedAt)}
            </div>

            ${
                tags
                    ? `
                        <div
                            style="
                                display:flex;
                                flex-wrap:wrap;
                                gap:5px;
                                margin-top:10px;
                            "
                        >
                            ${tags}
                        </div>
                    `
                    : ""
            }

            <div class="card-actions">

                <button
                    class="
                        small-button
                        favorite
                        ${note.favorite ? "active" : ""}
                    "
                    data-action="favorite"
                    data-id="${note.id}"
                >

                    <svg viewBox="0 0 24 24">
                        <path
                            d="m12 4 2.4 4.9
                               5.4.8-3.9 3.8
                               .9 5.4-4.8-2.5
                               -4.8 2.5.9-5.4
                               -3.9-3.8 5.4-.8z"
                        />
                    </svg>

                    ${note.favorite ? "مفضلة" : "إضافة"}

                </button>


                <button
                    class="small-button"
                    data-action="edit"
                    data-id="${note.id}"
                >

                    <svg viewBox="0 0 24 24">
                        <path
                            d="m4 20 4-.8L19 8.2
                               a2 2 0 0 0-3-3L5 16z"
                        />
                    </svg>

                    تعديل

                </button>


                <button
                    class="small-button"
                    data-action="delete"
                    data-id="${note.id}"
                >

                    <svg viewBox="0 0 24 24">
                        <path d="M4 7h16"/>
                        <path d="m6 7 1 14h10l1-14"/>
                        <path d="M9 7V4h6v3"/>
                    </svg>

                    سلة

                </button>

            </div>

        </article>
    `;

}


function bindNoteButtons(
    container
) {

    container
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            button.dataset.id;

                        const action =
                            button.dataset.action;


                        if (
                            action ===
                            "favorite"
                        ) {

                            await toggleFavorite(
                                "notes",
                                id
                            );

                        }


                        if (
                            action ===
                            "edit"
                        ) {

                            openNoteModal(id);

                        }


                        if (
                            action ===
                            "delete"
                        ) {

                            await moveToTrash(
                                "notes",
                                id
                            );

                        }

                    }
                );

            }
        );

}


/* -------------------------
   NOTE MODAL
------------------------- */

async function openNoteModal(
    id = null
) {

    state.editingNote = id;


    $("#noteForm").reset();


    if (id) {

        const note =
            await get(
                "notes",
                id
            );

        if (!note) return;


        $("#noteModalTitle")
            .textContent =
            "تعديل المعلومة";


        $("#noteTitle").value =
            note.title;

        $("#noteContent").value =
            note.content;

        $("#noteTags").value =
            (note.tags || []).join(", ");

    } else {

        $("#noteModalTitle")
            .textContent =
            "معلومة جديدة";

    }


    openModal(
        "noteModal"
    );

}


async function saveNote(event) {

    event.preventDefault();


    const title =
        $("#noteTitle")
            .value
            .trim();

    const content =
        $("#noteContent")
            .value
            .trim();


    if (!title || !content) {

        showToast(
            "أدخل العنوان والمحتوى"
        );

        return;

    }


    const tags =
        $("#noteTags")
            .value
            .split(",")
            .map(
                tag => tag.trim()
            )
            .filter(Boolean)
            .slice(0,20);


    const now =
        timestamp();


    let note;


    if (state.editingNote) {

        note =
            await get(
                "notes",
                state.editingNote
            );

        if (!note) return;


        note.title =
            title;

        note.content =
            content;

        note.tags =
            tags;

        note.updatedAt =
            now;

    } else {

        note = {

            id: createId(),

            title,

            content,

            tags,

            favorite: false,

            deleted: false,

            createdAt: now,

            updatedAt: now

        };

    }


    await put(
        "notes",
        note
    );


    await addHistory(
        state.editingNote
            ? "تم تعديل معلومة"
            : "تم إنشاء معلومة",
        note.title
    );


    closeModal(
        "noteModal"
    );


    showToast(
        state.editingNote
            ? "تم تعديل المعلومة"
            : "تم حفظ المعلومة"
    );


    state.editingNote =
        null;


    await renderAll();

}


/* -------------------------
   FOLDERS
------------------------- */

async function renderFolders() {

    const folders =
        await getAll("folders");


    const active =
        folders.filter(
            folder => !folder.deleted
        );


    const notes =
        await getAll("notes");


    if (!active.length) {

        $("#foldersGrid").innerHTML =
            `
                <div class="empty">
                    لا توجد مجلدات.
                </div>
            `;

        return;

    }


    $("#foldersGrid").innerHTML =
        active
            .map(
                folder => {

                    const count =
                        notes.filter(
                            note =>
                                !note.deleted &&
                                note.folderId === folder.id
                        ).length;


                    return `
                        <article
                            class="folder-card"
                            data-folder="${folder.id}"
                        >

                            <div class="folder-icon">

                                <svg viewBox="0 0 24 24">
                                    <path
                                        d="M3 7a2 2 0 0 1
                                           2-2h5l2 2h7
                                           a2 2 0 0 1
                                           2 2v9a2 2 0 0 1
                                           -2 2H5a2 2 0 0 1
                                           -2-2z"
                                    />
                                </svg>

                            </div>

                            <h3>
                                ${escapeHTML(folder.name)}
                            </h3>

                            <span>
                                ${count} معلومة
                            </span>

                        </article>
                    `;

                }
            )
            .join("");


    $$(".folder-card")
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        openFolder(
                            card.dataset.folder
                        );

                    }
                );

            }
        );

}


function openFolder(id) {

    state.currentFolder =
        id;

    showToast(
        "تم تحديد المجلد"
    );

    showPage("notes");

}


/* -------------------------
   CREATE FOLDER
------------------------- */

function openFolderModal() {

    $("#folderForm").reset();

    openModal(
        "folderModal"
    );

}


async function saveFolder(event) {

    event.preventDefault();


    const name =
        $("#folderName")
            .value
            .trim();


    if (!name) return;


    const now =
        timestamp();


    const folder = {

        id: createId(),

        name,

        parentId: null,

        deleted: false,

        createdAt: now,

        updatedAt: now

    };


    await put(
        "folders",
        folder
    );


    await addHistory(
        "تم إنشاء مجلد",
        name
    );


    closeModal(
        "folderModal"
    );


    showToast(
        "تم إنشاء المجلد"
    );


    await renderAll();

}


/* -------------------------
   IMAGES
------------------------- */

async function uploadImages(event) {

    const files =
        [...event.target.files];


    if (!files.length) return;


    showToast(
        `جاري حفظ ${files.length} صورة...`
    );


    for (const file of files) {

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            continue;

        }


        const now =
            timestamp();


        await put(
            "images",
            {

                id: createId(),

                name: file.name,

                type: file.type,

                size: file.size,

                blob: file,

                favorite: false,

                deleted: false,

                createdAt: now,

                updatedAt: now

            }
        );

    }


    event.target.value = "";


    await addHistory(
        "تم رفع صور",
        `${files.length} صورة`
    );


    await renderAll();


    showToast(
        "تم حفظ الصور"
    );

}


async function renderImages() {

    const images =
        await getAll("images");


    const active =
        images.filter(
            image => !image.deleted
        );


    if (!active.length) {

        $("#imagesGrid").innerHTML =
            `
                <div class="empty">
                    لا توجد صور بعد.
                    <br>
                    استخدم زر «رفع صور».
                </div>
            `;

        return;

    }


    $("#imagesGrid").innerHTML =
        "";


    for (const image of active) {

        const url =
            URL.createObjectURL(
                image.blob
            );


        const card =
            document.createElement(
                "article"
            );

        card.className =
            "image-card";


        card.innerHTML = `

            <div
                class="image-preview"
                data-image-open="${image.id}"
            >

                <img
                    src="${url}"
                    alt="${escapeHTML(image.name)}"
                >

            </div>

            <div class="image-info">

                <div class="image-name">
                    ${escapeHTML(image.name)}
                </div>

                <div class="image-size">
                    ${formatFileSize(image.size)}
                </div>

                <div class="card-actions">

                    <button
                        class="
                            small-button
                            favorite
                            ${image.favorite ? "active" : ""}
                        "
                        data-image-favorite="${image.id}"
                    >

                        <svg viewBox="0 0 24 24">
                            <path
                                d="m12 4 2.4 4.9
                                   5.4.8-3.9 3.8
                                   .9 5.4-4.8-2.5
                                   -4.8 2.5.9-5.4
                                   -3.9-3.8 5.4-.8z"
                            />
                        </svg>

                        ${image.favorite ? "مفضلة" : "مفضلة"}

                    </button>

                    <button
                        class="small-button"
                        data-image-delete="${image.id}"
                    >

                        <svg viewBox="0 0 24 24">
                            <path d="M4 7h16"/>
                            <path d="m6 7 1 14h10l1-14"/>
                            <path d="M9 7V4h6v3"/>
                        </svg>

                        سلة

                    </button>

                </div>

            </div>
        `;


        $("#imagesGrid")
            .appendChild(card);


        card
            .querySelector(
                "[data-image-open]"
            )
            .addEventListener(
                "click",
                () => {

                    openImageViewer(
                        image
                    );

                }
            );


        card
            .querySelector(
                "[data-image-favorite]"
            )
            .addEventListener(
                "click",
                async () => {

                    await toggleFavorite(
                        "images",
                        image.id
                    );

                }
            );


        card
            .querySelector(
                "[data-image-delete]"
            )
            .addEventListener(
                "click",
                async () => {

                    await moveToTrash(
                        "images",
                        image.id
                    );

                }
            );

    }

}


function openImageViewer(image) {

    const url =
        URL.createObjectURL(
            image.blob
        );


    $("#viewerImage").src =
        url;

    $("#viewerName")
        .textContent =
        image.name;


    openModal(
        "imageModal"
    );

}


/* -------------------------
   FAVORITES
------------------------- */

async function toggleFavorite(
    store,
    id
) {

    const item =
        await get(
            store,
            id
        );


    if (!item) return;


    item.favorite =
        !item.favorite;


    item.updatedAt =
        timestamp();


    await put(
        store,
        item
    );


    await addHistory(
        item.favorite
            ? "تمت إضافة عنصر للمفضلة"
            : "تمت إزالة عنصر من المفضلة",
        item.name ||
        item.title
    );


    showToast(
        item.favorite
            ? "تمت الإضافة للمفضلة"
            : "تمت الإزالة من المفضلة"
    );


    await renderAll();

}


async function renderFavorites() {

    const [
        notes,
        images
    ] = await Promise.all([
        getAll("notes"),
        getAll("images")
    ]);


    const favoriteNotes =
        notes.filter(
            note =>
                !note.deleted &&
                note.favorite
        );


    const favoriteImages =
        images.filter(
            image =>
                !image.deleted &&
                image.favorite
        );


    const container =
        $("#favoritesGrid");


    container.innerHTML = "";


    if (
        !favoriteNotes.length &&
        !favoriteImages.length
    ) {

        container.innerHTML =
            `
                <div class="empty">
                    لا توجد عناصر في المفضلة.
                </div>
            `;

        return;

    }


    container.innerHTML =
        favoriteNotes
            .map(createNoteHTML)
            .join("");


    bindNoteButtons(
        container
    );


    for (
        const image
        of favoriteImages
    ) {

        const url =
            URL.createObjectURL(
                image.blob
            );


        const card =
            document.createElement(
                "article"
            );

        card.className =
            "image-card";


        card.innerHTML = `

            <div
                class="image-preview"
                data-favorite-image="${image.id}"
            >
                <img
                    src="${url}"
                    alt=""
                >
            </div>

            <div class="image-info">

                <div class="image-name">
                    ${escapeHTML(image.name)}
                </div>

            </div>

        `;


        container.appendChild(
            card
        );


        card
            .querySelector(
                "[data-favorite-image]"
            )
            .addEventListener(
                "click",
                () => {

                    openImageViewer(
                        image
                    );

                }
            );

    }

}


/* -------------------------
   TRASH
------------------------- */

async function moveToTrash(
    store,
    id
) {

    const item =
        await get(
            store,
            id
        );


    if (!item) return;


    item.deleted =
        true;

    item.updatedAt =
        timestamp();


    await put(
        store,
        item
    );


    await addHistory(
        "تم نقل عنصر إلى السلة",
        item.title ||
        item.name
    );


    showToast(
        "تم نقل العنصر إلى السلة"
    );


    await renderAll();

}


async function renderTrash() {

    const [
        notes,
        images,
        folders
    ] = await Promise.all([
        getAll("notes"),
        getAll("images"),
        getAll("folders")
    ]);


    const deleted = [

        ...notes
            .filter(
                x => x.deleted
            )
            .map(
                x => ({
                    ...x,
                    store: "notes",
                    label: "معلومة",
                    name: x.title
                })
            ),

        ...images
            .filter(
                x => x.deleted
            )
            .map(
                x => ({
                    ...x,
                    store: "images",
                    label: "صورة"
                })
            ),

        ...folders
            .filter(
                x => x.deleted
            )
            .map(
                x => ({
                    ...x,
                    store: "folders",
                    label: "مجلد"
                })
            )

    ];


    if (!deleted.length) {

        $("#trashGrid").innerHTML =
            `
                <div class="empty">
                    سلة المهملات فارغة.
                </div>
            `;

        return;

    }


    $("#trashGrid").innerHTML =
        deleted
            .map(
                item => `

                    <article
                        class="info-card"
                    >

                        <h3>
                            ${escapeHTML(
                                item.name
                            )}
                        </h3>

                        <div
                            class="info-card-content"
                        >
                            ${item.label}
                        </div>

                        <div
                            class="card-actions"
                        >

                            <button
                                class="small-button"
                                data-restore
                                data-store="${item.store}"
                                data-id="${item.id}"
                            >
                                استرجاع
                            </button>

                            <button
                                class="small-button"
                                data-permanent
                                data-store="${item.store}"
                                data-id="${item.id}"
                            >
                                حذف نهائي
                            </button>

                        </div>

                    </article>

                `
            )
            .join("");


    $$("[data-restore]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const item =
                            await get(
                                button.dataset.store,
                                button.dataset.id
                            );


                        if (!item) return;


                        item.deleted =
                            false;

                        item.updatedAt =
                            timestamp();


                        await put(
                            button.dataset.store,
                            item
                        );


                        await addHistory(
                            "تم استرجاع عنصر",
                            item.title ||
                            item.name
                        );


                        showToast(
                            "تم استرجاع العنصر"
                        );


                        await renderAll();

                    }
                );

            }
        );


    $$("[data-permanent]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const ok =
                            confirm(
                                "هل تريد حذف هذا العنصر نهائياً؟"
                            );


                        if (!ok) return;


                        await remove(
                            button.dataset.store,
                            button.dataset.id
                        );


                        await addHistory(
                            "تم حذف عنصر نهائياً",
                            button.dataset.id
                        );


                        showToast(
                            "تم الحذف نهائياً"
                        );


                        await renderAll();

                    }
                );

            }
        );

}


async function emptyTrash() {

    const ok =
        confirm(
            "سيتم حذف جميع عناصر السلة نهائياً. هل أنت متأكد؟"
        );


    if (!ok) return;


    const stores = [
        "notes",
        "images",
        "folders"
    ];


    for (const store of stores) {

        const items =
            await getAll(store);


        for (const item of items) {

            if (item.deleted) {

                await remove(
                    store,
                    item.id
                );

            }

        }

    }


    await addHistory(
        "تم إفراغ سلة المهملات",
        "السلة"
    );


    showToast(
        "تم إفراغ السلة"
    );


    await renderAll();

}


/* -------------------------
   SEARCH
------------------------- */

function handleSearch(event) {

    const query =
        event.target.value
            .trim()
            .toLowerCase();


    clearTimeout(
        state.searchTimer
    );


    if (!query) {

        showPage(
            state.currentPage === "search"
                ? "home"
                : state.currentPage
        );

        return;

    }


    state.searchTimer =
        setTimeout(
            () => performSearch(query),
            150
        );

}


async function performSearch(query) {

    const [
        notes,
        folders,
        images
    ] = await Promise.all([
        getAll("notes"),
        getAll("folders"),
        getAll("images")
    ]);


    const matchingNotes =
        notes.filter(
            note =>
                !note.deleted &&
                (
                    note.title
                        .toLowerCase()
                        .includes(query) ||

                    note.content
                        .toLowerCase()
                        .includes(query) ||

                    (note.tags || [])
                        .some(
                            tag =>
                                tag
                                    .toLowerCase()
                                    .includes(query)
                        )
                )
        );


    const matchingFolders =
        folders.filter(
            folder =>
                !folder.deleted &&
                folder.name
                    .toLowerCase()
                    .includes(query)
        );


    const matchingImages =
        images.filter(
            image =>
                !image.deleted &&
                image.name
                    .toLowerCase()
                    .includes(query)
        );


    showPage(
        "search"
    );


    $("#searchResultsText")
        .textContent =
        `${matchingNotes.length} معلومات، ${matchingFolders.length} مجلدات، ${matchingImages.length} صور`;


    $("#searchGrid").innerHTML =
        "";


    if (
        !matchingNotes.length &&
        !matchingFolders.length &&
        !matchingImages.length
    ) {

        $("#searchGrid").innerHTML =
            `
                <div class="empty">
                    لا توجد نتائج للبحث.
                </div>
            `;

        return;

    }


    $("#searchGrid").innerHTML =
        matchingNotes
            .map(createNoteHTML)
            .join("");


    bindNoteButtons(
        $("#searchGrid")
    );

}


/* -------------------------
   HISTORY
------------------------- */

async function addHistory(
    action,
    item
) {

    await put(
        "history",
        {

            id: createId(),

            action,

            item,

            time: timestamp()

        }
    );

}


async function renderHistory() {

    const history =
        await getAll(
            "history"
        );


    history.sort(
        (a,b) =>
            new Date(b.time) -
            new Date(a.time)
    );


    const recent =
        history.slice(
            0,
            100
        );


    if (!recent.length) {

        $("#historyList").innerHTML =
            `
                <div class="empty">
                    لا يوجد سجل بعد.
                </div>
            `;

        return;

    }


    $("#historyList").innerHTML =
        recent
            .map(
                entry => `

                    <div
                        class="history-item"
                    >

                        <strong>
                            ${escapeHTML(
                                entry.action
                            )}
                            —
                            ${escapeHTML(
                                entry.item
                            )}
                        </strong>

                        <span>
                            ${formatDate(
                                entry.time
                            )}
                        </span>

                    </div>

                `
            )
            .join("");

}


/* -------------------------
   THEME
------------------------- */

function loadTheme() {

    const theme =
        localStorage.getItem(
            "information_theme"
        );


    if (theme === "light") {

        document.body
            .classList.add(
                "light"
            );

    }

}


function toggleTheme() {

    const light =
        document.body
            .classList
            .toggle(
                "light"
            );


    localStorage.setItem(
        "information_theme",
        light
            ? "light"
            : "dark"
    );

}


/* -------------------------
   DATE
------------------------- */

function updateDate() {

    $("#currentDate")
        .textContent =
        new Intl.DateTimeFormat(
            "ar-MA",
            {
                dateStyle: "full"
            }
        ).format(
            new Date()
        );

}


/* -------------------------
   MODALS
------------------------- */

function openModal(id) {

    const modal =
        $(`#${id}`);

    if (!modal) return;

    modal.classList.remove(
        "hidden"
    );

}


function closeModal(id) {

    const modal =
        $(`#${id}`);

    if (!modal) return;

    modal.classList.add(
        "hidden"
    );

}


/* -------------------------
   TOAST
------------------------- */

function showToast(message) {

    const container =
        $("#toastContainer");


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "toast";


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.remove();

        },
        2600
    );

}


/* -------------------------
   LOGOUT
------------------------- */

function logout() {

    sessionStorage.removeItem(
        SESSION_KEY
    );

    window.location.replace(
        "index.html"
    );

}