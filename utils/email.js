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

module.exports.sendVerificationEmail = async (email, token) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;
    if (!apiKey || !from) throw new Error("Email delivery is not configured.");

    const url = new URL("/verify-email/confirm", getAppBaseUrl());
    url.searchParams.set("token", token);
    const verificationUrl = url.toString();
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify({
            from,
            to: [email],
            subject: "Verify your WanderLust email",
            text: `Verify your WanderLust email by opening this link within 30 minutes: ${verificationUrl}`,
            html: `<p>Verify your email address to finish creating your WanderLust account.</p><p><a href="${verificationUrl}">Verify email address</a></p><p>This link expires in 30 minutes. If you did not create an account, you can ignore this message.</p>`
        }),
        signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
        throw new Error(`Email provider returned HTTP ${response.status}.`);
    }
};
