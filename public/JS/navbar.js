
document.addEventListener("DOMContentLoaded", () => {
    const searchToggle = document.getElementById("wlSearchToggle");
    const searchPanel = document.getElementById("wlSearchPanel");
    const destinationInput = document.getElementById("wlDestination");
    const suggestions = document.getElementById("wlSuggestions");

    const userMenuToggle = document.getElementById("wlUserMenuToggle");
    const userMenuToggles = [userMenuToggle].filter(Boolean);
    const userDropdown = document.getElementById("wlUserDropdown");


    // Toggle search panel
   searchToggle?.addEventListener("click", (event) => {
    event.stopPropagation();

    const isOpen = searchPanel.classList.toggle("show");

    userDropdown?.classList.remove("show");

    if (isOpen) {
        destinationInput?.focus();
    }
});

    // Destination suggestions
    destinationInput?.addEventListener("focus", () => {
        suggestions?.classList.add("show");
    });

    destinationInput?.addEventListener("input", () => {
        suggestions?.classList.add("show");
    });

    suggestions?.querySelectorAll("[data-location]").forEach((button) => {
        button.addEventListener("click", () => {
            destinationInput.value = button.dataset.location;
            suggestions.classList.remove("show");
        });
    });

    // Close suggestions when clicking outside the destination field
    destinationInput?.addEventListener("blur", () => {
        setTimeout(() => {
            suggestions?.classList.remove("show");
        }, 150);
    });

    // The menu control opens the user dropdown; the profile control navigates.
    const toggleUserMenu = (event) => {
        event.stopPropagation();

        const isOpen = userDropdown.classList.toggle("show");

        userMenuToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", String(isOpen)));
        searchPanel?.classList.remove("show");
    };
    userMenuToggle?.addEventListener("click", toggleUserMenu);

    // Close menus when clicking outside
    document.addEventListener("click", (event) => {
        if (!searchPanel?.contains(event.target) &&
            !searchToggle?.contains(event.target)) {
            searchPanel?.classList.remove("show");
        }

        if (!userDropdown?.contains(event.target) &&
            !userMenuToggles.some((toggle) => toggle.contains(event.target))) {
            userDropdown?.classList.remove("show");
            userMenuToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
        }
    });

    // Close menus with Escape
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            searchPanel?.classList.remove("show");
            userDropdown?.classList.remove("show");
            suggestions?.classList.remove("show");
            userMenuToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
        }
    });
});
