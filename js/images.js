requireLogin();

const uploadImagesButton =
    document.getElementById("uploadImages");

const imageInput =
    document.getElementById("imageInput");

const imagesGrid =
    document.getElementById("imagesGrid");


uploadImagesButton?.addEventListener(
    "click",
    () => imageInput.click()
);


imageInput?.addEventListener(
    "change",
    async () => {

        const files =
            Array.from(imageInput.files || []);

        if (!files.length) return;

        for (const file of files) {

            if (!file.type.startsWith("image/")) {
                continue;
            }

            const image = {

                id: generateId("image"),

                folderId,

                name: file.name,

                type: file.type,

                size: file.size,

                blob: file,

                favorite: false,

                deleted: false,

                createdAt: Date.now(),

                updatedAt: Date.now()
            };

            await dbAdd(
                "images",
                image
            );

            await addHistory(
                "upload",
                "image",
                image.id,
                {
                    name: file.name,
                    folderId
                }
            );
        }

        imageInput.value = "";

        await loadImages();
    }
);


async function loadImages() {

    const all =
        await dbGetAll("images");

    const images =
        all.filter(image =>
            !image.deleted &&
            image.folderId === folderId
        );

    renderImages(images);
}


function renderImages(images) {

    if (!images.length) {

        imagesGrid.innerHTML = `
            <div class="empty-state">
                لا توجد صور في هذا المجلد.
            </div>
        `;

        return;
    }

    imagesGrid.innerHTML = "";

    images.forEach(image => {

        const card =
            document.createElement("article");

        card.className =
            "image-card";

        const url =
            URL.createObjectURL(image.blob);

        card.innerHTML = `
            <img
                src="${url}"
                alt=""
            >

            <button
                class="image-delete"
                title="حذف"
            >
                ×
            </button>
        `;


        card
            .querySelector(".image-delete")
            .addEventListener("click", async event => {

                event.stopPropagation();

                if (
                    !confirm(
                        "هل تريد نقل هذه الصورة إلى المهملات؟"
                    )
                ) return;

                image.deleted = true;
                image.updatedAt = Date.now();

                await dbPut(
                    "images",
                    image
                );

                await addHistory(
                    "delete",
                    "image",
                    image.id,
                    { name: image.name }
                );

                URL.revokeObjectURL(url);

                await loadImages();
            });


        card.addEventListener(
            "click",
            () => {

                window.open(
                    url,
                    "_blank"
                );
            }
        );


        imagesGrid.appendChild(card);
    });
}


loadImages();