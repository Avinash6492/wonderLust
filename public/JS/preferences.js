(() => {
    const storageKey = "wanderlust-preferences";
    const rateStorageKey = "wanderlust-inr-rates-v1";
    const languages = ["en", "hi"];
    const currencies = ["INR", "USD", "EUR", "GBP", "AED"];
    const locales = { en: "en-IN", hi: "hi-IN" };
    const messages = {
        en: {
            "home.heading": "Find your next getaway.",
            "home.subtitle": "Discover places worth staying for.",
            "search.where": "Where",
            "search.destinationPlaceholder": "Search destinations",
            "search.search": "Search",
            "nav.host": "Host your home",
            "nav.saved": "Saved stays",
            "nav.explore": "Explore listings",
            "nav.preferences": "Languages & currency",
            "nav.help": "Help Centre",
            "nav.becomeHost": "Become a host",
            "nav.hostText": "It’s easy to start hosting and earn extra income.",
            "nav.referHost": "Refer a host",
            "nav.findCohost": "Find a co-host",
            "nav.login": "Log in or sign up",
            "nav.profile": "Your profile",
            "nav.logout": "Log out",
            "price.toggleTitle": "Display total price",
            "price.toggleSubtitle": "Includes all nights, before taxes",
            "price.numberOfNights": "Number of nights",
            "price.perNight": " / night",
            "price.oneNight": " / 1 night",
            "price.nights": ({ nights }) => ` / ${nights} nights`,
            "price.stayOneNight": "1 night selected.",
            "price.stayNights": ({ nights }) => `${nights} nights selected.`,
            "price.estimateTitle": "Estimate your stay",
            "price.checkIn": "Check-in",
            "price.checkOut": "Check-out",
            "price.chooseDates": "Choose dates to see your total.",
            "price.estimatedTotal": "Estimated total",
            "price.estimateDisclaimer": "Nightly rate × nights. Taxes and fees are not included; this is not a reservation.",
            "price.checkoutAfterCheckin": "Check-out must be after check-in.",
            "reviews.see": "See guest reviews",
            "reviews.invitation": "Have a stay to share? Add your review below.",
            "prefs.title": "Language and currency",
            "prefs.language": "Language",
            "prefs.currency": "Currency",
            "prefs.save": "Save preferences",
            "prefs.ratesError": "Exchange rates are unavailable right now. Please try again.",
            "footer.privacy": "Privacy",
            "footer.terms": "Terms",
            "footer.company": "Company details",
            "legal.privacyEyebrow": "YOUR INFORMATION",
            "legal.privacyTitle": "Privacy Policy",
            "legal.termsEyebrow": "USING WANDERLUST",
            "legal.termsTitle": "Terms and Conditions",
            "legal.companyEyebrow": "ABOUT THE OPERATOR",
            "legal.companyTitle": "Company details",
            "language.label": "English (India)"
        },
        hi: {
            "home.heading": "अपनी अगली छुट्टी खोजें।",
            "home.subtitle": "ठहरने के लिए शानदार जगहें खोजें।",
            "search.where": "कहाँ",
            "search.destinationPlaceholder": "जगहें खोजें",
            "search.search": "खोजें",
            "nav.host": "अपना घर होस्ट करें",
            "nav.saved": "सेव की गई जगहें",
            "nav.explore": "लिस्टिंग देखें",
            "nav.preferences": "भाषा और मुद्रा",
            "nav.help": "सहायता केंद्र",
            "nav.becomeHost": "होस्ट बनें",
            "nav.hostText": "होस्टिंग शुरू करना और अतिरिक्त कमाई करना आसान है।",
            "nav.referHost": "होस्ट को आमंत्रित करें",
            "nav.findCohost": "को-होस्ट खोजें",
            "nav.login": "लॉग इन या साइन अप करें",
            "nav.profile": "आपकी प्रोफ़ाइल",
            "nav.logout": "लॉग आउट",
            "price.toggleTitle": "कुल कीमत दिखाएँ",
            "price.toggleSubtitle": "सभी रातों की कीमत, टैक्स से पहले",
            "price.numberOfNights": "रातों की संख्या",
            "price.perNight": " / रात",
            "price.oneNight": " / 1 रात",
            "price.nights": ({ nights }) => ` / ${nights} रातें`,
            "price.stayOneNight": "1 रात चुनी गई।",
            "price.stayNights": ({ nights }) => `${nights} रातें चुनी गईं।`,
            "price.estimateTitle": "अपने ठहरने की कीमत देखें",
            "price.checkIn": "चेक-इन",
            "price.checkOut": "चेक-आउट",
            "price.chooseDates": "कुल कीमत देखने के लिए तारीखें चुनें।",
            "price.estimatedTotal": "अनुमानित कुल",
            "price.estimateDisclaimer": "प्रति रात की कीमत × रातें। टैक्स और शुल्क शामिल नहीं हैं; यह बुकिंग नहीं है।",
            "price.checkoutAfterCheckin": "चेक-आउट की तारीख चेक-इन के बाद होनी चाहिए।",
            "reviews.see": "मेहमानों की समीक्षाएँ देखें",
            "reviews.invitation": "अपना अनुभव साझा करें। नीचे समीक्षा लिखें।",
            "prefs.title": "भाषा और मुद्रा",
            "prefs.language": "भाषा",
            "prefs.currency": "मुद्रा",
            "prefs.save": "पसंद सहेजें",
            "prefs.ratesError": "अभी विनिमय दरें उपलब्ध नहीं हैं। कृपया फिर कोशिश करें।",
            "footer.privacy": "गोपनीयता",
            "footer.terms": "नियम और शर्तें",
            "footer.company": "कंपनी की जानकारी",
            "legal.privacyEyebrow": "आपकी जानकारी",
            "legal.privacyTitle": "गोपनीयता नीति",
            "legal.termsEyebrow": "वॉन्डरलस्ट का उपयोग",
            "legal.termsTitle": "नियम और शर्तें",
            "legal.companyEyebrow": "संचालक के बारे में",
            "legal.companyTitle": "कंपनी की जानकारी",
            "language.label": "हिन्दी (भारत)"
        }
    };

    let preferences = { language: "en", currency: "INR" };
    let rates = { INR: 1 };

    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
        if (languages.includes(saved.language)) preferences.language = saved.language;
        if (currencies.includes(saved.currency)) preferences.currency = saved.currency;
        const cached = JSON.parse(localStorage.getItem(rateStorageKey) || "null");
        if (cached?.rates && Date.now() - cached.savedAt < 36 * 60 * 60 * 1000) rates = cached.rates;
    } catch { /* Preferences can still be changed for this page view. */ }

    const translate = (key, variables = {}) => {
        const value = messages[preferences.language][key] ?? messages.en[key] ?? key;
        return typeof value === "function" ? value(variables) : value;
    };
    const formatPrice = (amount) => {
        const rate = Number(rates[preferences.currency]) || 1;
        const locale = preferences.currency === "INR" ? locales[preferences.language] : {
            USD: "en-US", EUR: "de-DE", GBP: "en-GB", AED: "en-AE"
        }[preferences.currency];
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: preferences.currency,
            maximumFractionDigits: preferences.currency === "INR" ? 0 : 2
        }).format((Number(amount) || 0) * rate);
    };
    window.wanderlustTranslate = translate;
    window.wanderlustFormatPrice = formatPrice;

    const applyPrices = () => {
        document.querySelectorAll(".price-value[data-price-inr]").forEach((element) => {
            element.textContent = formatPrice(element.dataset.priceInr);
        });
    };
    window.addEventListener("wanderlust:prices-updated", applyPrices);

    const applyLanguage = () => {
        document.documentElement.lang = locales[preferences.language];
        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const variables = {};
            if (element.dataset.nights) variables.nights = Number(element.dataset.nights);
            element.textContent = translate(element.dataset.i18n, variables);
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
            element.placeholder = translate(element.dataset.i18nPlaceholder);
        });
        document.querySelectorAll("[data-i18n-title]").forEach((element) => {
            element.title = translate(element.dataset.i18nTitle);
            element.setAttribute("aria-label", element.title);
        });
        const languageLabel = document.getElementById("footerLanguage");
        if (languageLabel) languageLabel.textContent = translate("language.label");
        document.dispatchEvent(new Event("wanderlust:language-changed"));
    };

    const applyPreferences = () => {
        applyLanguage();
        applyPrices();
        const currencyLabel = document.getElementById("footerCurrency");
        if (currencyLabel) currencyLabel.textContent = preferences.currency;
        const languageSelect = document.getElementById("preferenceLanguage");
        const currencySelect = document.getElementById("preferenceCurrency");
        if (languageSelect) languageSelect.value = preferences.language;
        if (currencySelect) currencySelect.value = preferences.currency;
    };

    const loadRates = async () => {
        if (currencies.every((currency) => rates[currency])) return;
        const response = await fetch("https://api.frankfurter.dev/v2/rates?base=INR&quotes=USD,EUR,GBP,AED", { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("Exchange-rate request failed");
        const payload = await response.json();
        for (const row of Array.isArray(payload) ? payload : []) {
            const currency = String(row.quote || "").toUpperCase();
            const rate = Number(row.rate);
            if (currencies.includes(currency) && Number.isFinite(rate) && rate > 0) rates[currency] = rate;
        }
        if (currencies.some((currency) => !rates[currency])) throw new Error("Exchange-rate response was incomplete");
        try { localStorage.setItem(rateStorageKey, JSON.stringify({ rates, savedAt: Date.now() })); } catch { /* optional cache */ }
    };

    document.addEventListener("DOMContentLoaded", () => {
        applyPreferences();

        const openers = document.querySelectorAll("[data-open-preferences]");
        const dialog = document.getElementById("preferencesDialog");
        const form = document.getElementById("preferencesForm");
        const languageSelect = document.getElementById("preferenceLanguage");
        const currencySelect = document.getElementById("preferenceCurrency");
        const error = document.getElementById("preferencesError");

        openers.forEach((button) => button.addEventListener("click", (event) => {
            event.preventDefault();
            document.getElementById("wlUserDropdown")?.classList.remove("show");
            if (!dialog?.open) dialog?.showModal();
        }));

        form?.addEventListener("submit", async (event) => {
            event.preventDefault();
            const next = { language: languageSelect.value, currency: currencySelect.value };
            if (!languages.includes(next.language) || !currencies.includes(next.currency)) return;
            error.textContent = "";
            const previous = preferences;
            preferences = next;
            try {
                if (next.currency !== "INR") await loadRates();
                try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch { /* preference still applies for this page view */ }
                applyPreferences();
                dialog.close();
            } catch {
                preferences = previous;
                error.textContent = translate("prefs.ratesError");
                applyPreferences();
            }
        });

        if (preferences.currency !== "INR") {
            loadRates().then(applyPrices).catch(() => {
                preferences.currency = "INR";
                try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch { /* optional */ }
                applyPreferences();
                if (error) error.textContent = translate("prefs.ratesError");
            });
        }
    });
})();
