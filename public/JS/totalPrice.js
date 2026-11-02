document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("totalPriceToggle");
    const nightSelector = document.getElementById("nightSelectorContainer");
    const nightsInput = document.getElementById("numberOfNights");
    const priceElements = document.querySelectorAll(".listing-price");
    if (!toggle || !nightSelector || !nightsInput || !priceElements.length) return;

    let savedToggle = null;
    let savedNights = NaN;
    try {
        savedToggle = localStorage.getItem("wanderlust-show-total-price");
        savedNights = Number(localStorage.getItem("wanderlust-price-nights"));
    } catch { /* Keep the default settings when browser storage is disabled. */ }
    toggle.checked = savedToggle === "true";
    if ([...nightsInput.options].some((option) => Number(option.value) === savedNights)) {
        nightsInput.value = String(savedNights);
    }

    const format = (amount) => window.wanderlustFormatPrice
        ? window.wanderlustFormatPrice(amount)
        : `₹ ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;

    const updatePrices = () => {
        const showTotal = toggle.checked;
        const nights = Number(nightsInput.value) || 1;
        nightSelector.hidden = !showTotal;
        try {
            localStorage.setItem("wanderlust-show-total-price", String(showTotal));
            localStorage.setItem("wanderlust-price-nights", String(nights));
        } catch { /* Keep the control usable when browser storage is disabled. */ }

        priceElements.forEach((element) => {
            const nightlyPrice = Number(element.dataset.nightlyPrice) || 0;
            const priceValue = element.querySelector(".price-value");
            if (!priceValue) return;
            const displayedPrice = showTotal ? nightlyPrice * nights : nightlyPrice;
            priceValue.dataset.priceInr = String(displayedPrice);
            priceValue.textContent = format(displayedPrice);

            const period = element.querySelector(".price-period");
            if (period) {
                period.dataset.i18n = showTotal
                    ? (nights === 1 ? "price.oneNight" : "price.nights")
                    : "price.perNight";
                period.dataset.nights = String(nights);
                period.textContent = window.wanderlustTranslate
                    ? window.wanderlustTranslate(period.dataset.i18n, { nights })
                    : showTotal ? ` / ${nights} ${nights === 1 ? "night" : "nights"}` : " / night";
            }
        });
        window.dispatchEvent(new Event("wanderlust:prices-updated"));
    };

    toggle.addEventListener("change", updatePrices);
    nightsInput.addEventListener("change", updatePrices);
    document.addEventListener("wanderlust:language-changed", updatePrices);
    updatePrices();
});
