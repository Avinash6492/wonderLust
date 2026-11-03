const getAppBaseUrl = () => {
    const configuredUrl = process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL;
    if (configuredUrl) {
        const parsed = new URL(configuredUrl);
        if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
            throw new Error("APP_BASE_URL must use HTTPS in production.");
        }
        return parsed.origin;
    }

    if (process.env.NODE_ENV === "production") {
        throw new Error("The public application URL is not configured.");
    }
    return `http://localhost:${process.env.PORT || 8000}`;
};

const sendEmail = async ({ to, subject, text, html }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;
    if (!apiKey || !from) throw new Error("Email delivery is not configured.");

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify({ from, to: [to], subject, text, html }),
        signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) throw new Error(`Email provider returned HTTP ${response.status}.`);
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
}[character]));

module.exports.sendVerificationEmail = async (email, token) => {
    const url = new URL("/verify-email/confirm", getAppBaseUrl());
    url.searchParams.set("token", token);
    const verificationUrl = url.toString();
    await sendEmail({
        to: email,
        subject: "Verify your WanderLust email",
        text: `Verify your WanderLust email by opening this link within 30 minutes: ${verificationUrl}`,
        html: `<p>Verify your email address to finish creating your WanderLust account.</p><p><a href="${verificationUrl}">Verify email address</a></p><p>This link expires in 30 minutes. If you did not create an account, you can ignore this message.</p>`
    });
};

module.exports.sendReservationRequestEmail = async (email, reservation) => {
    const baseUrl = getAppBaseUrl();
    const reference = reservation._id.toString().slice(-8).toUpperCase();
    const title = escapeHtml(reservation.listingTitle);
    const location = escapeHtml(reservation.listingLocation);
    const dateOptions = { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" };
    const checkIn = new Date(reservation.checkIn).toLocaleDateString("en-IN", dateOptions);
    const checkOut = new Date(reservation.checkOut).toLocaleDateString("en-IN", dateOptions);
    const total = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(reservation.subtotal);
    const reservationUrl = new URL(`/reservations/${reservation._id}/payment`, baseUrl).toString();
    await sendEmail({
        to: email,
        subject: `WanderLust reservation request ${reference}`,
        text: `Your reservation request for ${reservation.listingTitle} was received. Dates: ${checkIn} to ${checkOut}. Guests: ${reservation.guestCount}. Estimate: ${total}. Payment is not available yet, no payment was taken, and the stay is not confirmed. View the request: ${reservationUrl}`,
        html: `<h2>Reservation request received</h2><p><strong>Reference:</strong> ${reference}</p><p><strong>Stay:</strong> ${title}<br><strong>Location:</strong> ${location}</p><p><strong>Dates:</strong> ${checkIn} – ${checkOut}<br><strong>Guests:</strong> ${reservation.guestCount}<br><strong>Length:</strong> ${reservation.nights} nights</p><p><strong>Estimated subtotal:</strong> ${total} INR</p><p>Payment is not available yet. No payment was taken, and this stay is not confirmed.</p><p><a href="${reservationUrl}">View reservation request</a></p>`
    });
};
