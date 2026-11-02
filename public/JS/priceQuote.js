document.addEventListener("DOMContentLoaded", () => {
    const quote = document.querySelector(".stay-total-estimate");
    const checkIn = document.getElementById("checkInDate");
    const checkOut = document.getElementById("checkOutDate");
    const nightsLabel = document.getElementById("stayEstimateNights");
    const total = document.getElementById("stayEstimateTotal");
    if (!quote || !checkIn || !checkOut || !nightsLabel || !total) return;

    const localDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayString = localDateString(new Date());
    checkIn.min = todayString;
    checkOut.min = localDateString(tomorrow);

    const translate = (key, vars) => window.wanderlustTranslate
        ? window.wanderlustTranslate(key, vars)
        : key;
    const format = (amount) => window.wanderlustFormatPrice
        ? window.wanderlustFormatPrice(amount)
        : `₹ ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;

    const updateQuote = () => {
        const start = checkIn.value ? new Date(`${checkIn.value}T00:00:00`) : null;
        const end = checkOut.value ? new Date(`${checkOut.value}T00:00:00`) : null;
        checkOut.min = start ? localDateString(new Date(start.getTime() + 86400000)) : localDateString(tomorrow);

        if (!start || !end || end <= start) {
            if (end && start && end <= start) checkOut.setCustomValidity(translate("price.checkoutAfterCheckin"));
            else checkOut.setCustomValidity("");
            nightsLabel.textContent = translate("price.chooseDates");
            total.dataset.priceInr = "0";
            total.textContent = format(0);
            window.dispatchEvent(new Event("wanderlust:prices-updated"));
            return;
        }

        checkOut.setCustomValidity("");
        const nights = Math.round((end - start) / 86400000);
        const totalPrice = (Number(quote.dataset.nightlyPrice) || 0) * nights;
        nightsLabel.textContent = translate(nights === 1 ? "price.stayOneNight" : "price.stayNights", { nights });
        total.dataset.priceInr = String(totalPrice);
        total.textContent = format(totalPrice);
        window.dispatchEvent(new Event("wanderlust:prices-updated"));
    };

    checkIn.addEventListener("change", updateQuote);
    checkOut.addEventListener("change", updateQuote);
    document.addEventListener("wanderlust:language-changed", updateQuote);
    updateQuote();
});
