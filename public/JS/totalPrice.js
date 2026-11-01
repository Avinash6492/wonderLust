
document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("totalPriceToggle");
    const nightSelector = document.getElementById("nightSelectorContainer");
    const nightsInput = document.getElementById("numberOfNights");
    const priceElements = document.querySelectorAll(".listing-price");

    if (!toggle || !nightSelector || !nightsInput) return;

    function formatPrice(price) {
        return new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 0
        }).format(price);
    }

    function updatePrices() {
        const showTotal = toggle.checked;
        const nights = Number(nightsInput.value) || 1;

        nightSelector.hidden = !showTotal;

        priceElements.forEach((element) => {
            const nightlyPrice = Number(element.dataset.nightlyPrice) || 0;
            const displayedPrice = showTotal
                ? nightlyPrice * nights
                : nightlyPrice;

            const priceLabel = showTotal
                ? ` / ${nights} ${nights === 1 ? "night" : "nights"}`
                : " / night";

            element.innerHTML = `
                <strong>₹ ${formatPrice(displayedPrice)}</strong>
                <span class="price-period">${priceLabel}</span>
            `;
        });
    }

    toggle.addEventListener("change", updatePrices);
    nightsInput.addEventListener("change", updatePrices);

    updatePrices();
});
