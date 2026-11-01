document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const input = document.getElementById(toggle.dataset.passwordToggle);
            if (!input) return;

            const showPassword = input.type === "password";
            input.type = showPassword ? "text" : "password";
            toggle.setAttribute("aria-pressed", String(showPassword));
            toggle.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");

            const icon = toggle.querySelector("i");
            icon?.classList.toggle("bi-eye", !showPassword);
            icon?.classList.toggle("bi-eye-slash", showPassword);
        });
    });

    document.querySelectorAll(".auth-form").forEach((form) => {
        const fields = [...form.querySelectorAll(".auth-field")];

        const updateField = (field) => {
            const input = field.querySelector("input");
            const invalid = input && !input.validity.valid;
            field.classList.toggle("is-invalid", Boolean(invalid));
            input?.setAttribute("aria-invalid", String(Boolean(invalid)));
        };

        form.addEventListener("submit", () => fields.forEach(updateField));
        fields.forEach((field) => {
            field.querySelector("input")?.addEventListener("input", () => updateField(field));
        });
    });
});
