const crypto = require("crypto");
const User = require("../models/user.js");
const { sendVerificationEmail } = require("./email.js");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

module.exports.issueEmailVerification = async (user) => {
    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationTokenHash = hashToken(token);
    user.emailVerificationExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    await sendVerificationEmail(user.email, token);
};

module.exports.verifyEmailToken = async (token) => {
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) return null;
    return User.findOneAndUpdate(
        {
            emailVerificationTokenHash: hashToken(token),
            emailVerificationExpiresAt: { $gt: new Date() },
            emailVerified: false
        },
        {
            $set: { emailVerified: true },
            $unset: { emailVerificationTokenHash: 1, emailVerificationExpiresAt: 1 }
        },
        { new: true }
    );
};
