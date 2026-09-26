requireLogin();

const params = new URLSearchParams(
    window.location.search
);

const folderId = params.get("id");

const folderTitle =
    document.getElementById("folderTitle");

const folderSubtitle =
    document.getElementById("folderSubtitle");

const subfolders =
    document.getElementById("subfolders");


if (!folderId) {
    window.location.replace("dashboard.html");
}


async function loadFolder() {

    const folder =
        await dbGet("folders", folderId);

    if (!folder || folder.deleted) {
        window.location.replace("dashboard.html");
        return;
    }

    folderTitle.textContent = folder.name;

    const allFolders =
        await dbGetAll("folders");

    const children =
        allFolders.filter(item =>
            !item.deleted &&
            item.parentId === folderId
        );

    renderSubfolders(children);

    folderSubtitle.textContent =
        `${children.length} مجلد فرعي`;

}


function renderSubfolders(items) {

    if (!items.length) {

        subfolders.innerHTML = `
            <div class="empty-state">
                لا توجد مجلدات فرعية.
            </div>
        `;

        return;
    }

    subfolders.innerHTML = "";

    items.forEach(folder => {

        const card =
            document.createElement("article");

        card.className =
            "subfolder-card";

        card.innerHTML = `
            <div class="folder-icon">
                <svg viewBox="0 0 24 24">
                    <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
                </svg>
            </div>

            <strong></strong>
        `;

        card.querySelector("strong")
            .textContent = folder.name;

        card.addEventListener("click", () => {
            window.location.href =
                `folder.html?id=${encodeURIComponent(folder.id)}`;
        });

        subfolders.appendChild(card);
    });
}


document
    .getElementById("newSubfolder")
    ?.addEventListener("click", () => {

        document
            .getElementById("subfolderModal")
            .classList.remove("hidden");

        document
            .getElementById("subfolderName")
            .focus();
    });


function closeSubfolderModal() {

    document
        .getElementById("subfolderModal")
        .classList.add("hidden");

    document
        .getElementById("subfolderForm")
        .reset();
}


document
    .getElementById("closeSubfolderModal")
    ?.addEventListener("click", closeSubfolderModal);


document
    .getElementById("cancelSubfolder")
    ?.addEventListener("click", closeSubfolderModal);


document
    .getElementById("subfolderForm")
    ?.addEventListener("submit", async event => {

        event.preventDefault();

        const name =
            document
                .getElementById("subfolderName")
                .value
                .trim();

        if (!name) return;

        const folder = {

            id: generateId("folder"),

            name,

            parentId: folderId,

            deleted: false,

            createdAt: Date.now(),

            updatedAt: Date.now()

        };

        await dbAdd("folders", folder);

        await addHistory(
            "create",
            "folder",
            folder.id,
            {
                name,
                parentId: folderId
            }
        );

        closeSubfolderModal();

        await loadFolder();
    });


document
    .getElementById("backButton")
    ?.addEventListener("click", () => {

        window.location.href =
            "dashboard.html";
    });


loadFolder();