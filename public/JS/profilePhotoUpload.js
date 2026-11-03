document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".profile-photo-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = form.querySelector("button[type='submit']");
        const csrfToken = form.querySelector("input[name='_csrf']")?.value;
        if (!csrfToken || !form.reportValidity()) return;

        const originalLabel = submitButton?.innerHTML;
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Uploading…";
        }

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { "X-CSRF-Token": csrfToken }
            });
            if (!response.ok) throw new Error("The photo could not be uploaded.");
            window.location.assign(response.url || "/profile");
        } catch (error) {
            const message = document.getElementById("profilePhotoUploadStatus");
            if (message) message.textContent = error.message;
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalLabel;
            }
        }
    });
});
