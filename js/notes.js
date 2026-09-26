requireLogin();

const noteModal =
    document.getElementById("noteModal");

const noteForm =
    document.getElementById("noteForm");

const noteTitle =
    document.getElementById("noteTitle");

const noteContent =
    document.getElementById("noteContent");

const noteId =
    document.getElementById("noteId");

const notesList =
    document.getElementById("notesList");

let currentLocation = null;


function openNoteModal(note = null) {

    noteModal.classList.remove("hidden");

    if (note) {

        document.getElementById("noteModalTitle")
            .textContent = "تعديل الملاحظة";

        noteId.value = note.id;
        noteTitle.value = note.title;
        noteContent.value = note.content;

        currentLocation = note.location || null;

    } else {

        document.getElementById("noteModalTitle")
            .textContent = "ملاحظة جديدة";

        noteForm.reset();

        noteId.value = "";

        currentLocation = null;
    }
}


function closeNoteModal() {

    noteModal.classList.add("hidden");

    noteForm.reset();

    noteId.value = "";

    currentLocation = null;

    document.getElementById(
        "locationStatus"
    ).textContent = "";
}


document
    .getElementById("newNote")
    ?.addEventListener("click", () => {
        openNoteModal();
    });


document
    .getElementById("closeNoteModal")
    ?.addEventListener("click", closeNoteModal);


document
    .getElementById("cancelNote")
    ?.addEventListener("click", closeNoteModal);


document
    .getElementById("getLocation")
    ?.addEventListener("click", async () => {

        const status =
            document.getElementById(
                "locationStatus"
            );

        status.textContent =
            "جاري تحديد الموقع...";

        try {

            currentLocation =
                await getCurrentLocation();

            status.textContent =
                "تم حفظ الموقع ✓";

        } catch {

            status.textContent =
                "تعذر الحصول على الموقع.";

            currentLocation = null;
        }
    });


noteForm?.addEventListener("submit", async event => {

    event.preventDefault();

    const title =
        noteTitle.value.trim();

    const content =
        noteContent.value.trim();

    if (!title) return;

    const existing =
        noteId.value
            ? await dbGet("notes", noteId.value)
            : null;


    const note = {

        id: existing
            ? existing.id
            : generateId("note"),

        folderId,

        title,

        content,

        location: currentLocation,

        favorite: existing
            ? existing.favorite
            : false,

        deleted: false,

        createdAt: existing
            ? existing.createdAt
            : Date.now(),

        updatedAt: Date.now()
    };


    await dbPut("notes", note);


    await addHistory(
        existing ? "update" : "create",
        "note",
        note.id,
        {
            title: note.title,
            folderId
        }
    );


    closeNoteModal();

    await loadNotes();
});


async function loadNotes() {

    const notes =
        await dbGetAll("notes");

    const items =
        notes.filter(note =>
            !note.deleted &&
            note.folderId === folderId
        );

    renderNotes(items);
}


function renderNotes(items) {

    if (!items.length) {

        notesList.innerHTML = `
            <div class="empty-state">
                لا توجد ملاحظات في هذا المجلد.
            </div>
        `;

        return;
    }

    notesList.innerHTML = "";

    items
        .sort((a, b) =>
            b.updatedAt - a.updatedAt
        )
        .forEach(note => {

            const card =
                document.createElement("article");

            card.className =
                "note-card";

            card.innerHTML = `
                <div class="note-header">

                    <h3></h3>

                    <span>
                        ${note.favorite ? "⭐" : ""}
                    </span>

                </div>

                <div class="note-content"></div>

                <div class="note-actions">

                    <button class="edit-note">
                        تعديل
                    </button>

                    <button class="favorite-note">
                        ${note.favorite
                            ? "إزالة من المفضلة"
                            : "إضافة للمفضلة"}
                    </button>

                    <button class="delete-note">
                        حذف
                    </button>

                </div>
            `;


            card.querySelector("h3")
                .textContent = note.title;


            card.querySelector(".note-content")
                .textContent = note.content;


            card
                .querySelector(".edit-note")
                .addEventListener("click", () => {
                    openNoteModal(note);
                });


            card
                .querySelector(".favorite-note")
                .addEventListener("click", async () => {

                    note.favorite =
                        !note.favorite;

                    note.updatedAt =
                        Date.now();

                    await dbPut(
                        "notes",
                        note
                    );

                    await addHistory(
                        note.favorite
                            ? "favorite"
                            : "unfavorite",
                        "note",
                        note.id,
                        { title: note.title }
                    );

                    await loadNotes();
                });


            card
                .querySelector(".delete-note")
                .addEventListener("click", async () => {

                    if (
                        !confirm(
                            "هل تريد نقل الملاحظة إلى المهملات؟"
                        )
                    ) return;

                    note.deleted = true;
                    note.updatedAt = Date.now();

                    await dbPut(
                        "notes",
                        note
                    );

                    await addHistory(
                        "delete",
                        "note",
                        note.id,
                        { title: note.title }
                    );

                    await loadNotes();
                });


            notesList.appendChild(card);
        });
}


loadNotes();