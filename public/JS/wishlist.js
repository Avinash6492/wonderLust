document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".listing-wishlist-button");
    const storageKey = "wanderlust-wishlist";
    const config = window.wishlistConfig || { loggedIn: false, ids: [] };
    let savedIds = new Set((config.ids || []).map(String));

    const readLocalIds = () => {
        try {
            const ids = JSON.parse(localStorage.getItem(storageKey) || "[]");
            return Array.isArray(ids) ? ids.map(String) : [];
        } catch {
            return [];
        }
    };

    const writeLocalIds = (ids) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(ids));
        } catch {
            // The current page can still use the toggle if browser storage is unavailable.
        }
    };

    const updateButton = (button, isSaved) => {
        const title = isSaved ? "Remove from wishlist" : "Add to wishlist";
        button.classList.toggle("is-active", isSaved);
        button.setAttribute("aria-pressed", String(isSaved));
        button.setAttribute("aria-label", `${title}: ${button.dataset.listingTitle || "listing"}`);
        button.title = title;

        const icon = button.querySelector("i");
        icon?.classList.toggle("fa-solid", isSaved);
        icon?.classList.toggle("fa-regular", !isSaved);
    };

    const renderButtons = () => {
        buttons.forEach((button) => {
            updateButton(button, savedIds.has(String(button.dataset.listingId)));
        });
    };

    const sendWishlistUpdate = async (url, method, body) => {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) throw new Error("Wishlist update failed");
        return response.json();
    };

    const syncGuestWishlist = async (ids) => {
        let result = { ids: [...savedIds] };
        for (let index = 0; index < ids.length; index += 100) {
            result = await sendWishlistUpdate("/wishlist", "PUT", { ids: ids.slice(index, index + 100) });
        }
        return result;
    };

    renderButtons();

    if (config.loggedIn) {
        const guestIds = readLocalIds();
        if (guestIds.length) {
            syncGuestWishlist(guestIds)
                .then(({ ids }) => {
                    savedIds = new Set((ids || []).map(String));
                    writeLocalIds([]);
                    renderButtons();
                })
                .catch(() => {});
        }
    } else {
        savedIds = new Set(readLocalIds());
        renderButtons();
    }

    buttons.forEach((button) => {
        button.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const id = String(button.dataset.listingId);
            const wasSaved = savedIds.has(id);
            if (wasSaved) savedIds.delete(id);
            else savedIds.add(id);
            renderButtons();

            if (!config.loggedIn) {
                writeLocalIds([...savedIds]);
                return;
            }

            try {
                const result = await sendWishlistUpdate(
                    `/wishlist/${encodeURIComponent(id)}`,
                    wasSaved ? "DELETE" : "POST"
                );
                savedIds = new Set((result.ids || []).map(String));
                renderButtons();
            } catch {
                if (wasSaved) savedIds.add(id);
                else savedIds.delete(id);
                renderButtons();
                button.title = "Couldn't update saved stays. Please try again.";
            }
        });
    });
});
