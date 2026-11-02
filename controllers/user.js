const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const { cloudinary } = require("../cloudConfig.js");
const { issueEmailVerification, verifyEmailToken } = require("../utils/emailVerification.js");

module.exports.showSignUp = (req, res) => {
    res.render("users/signUp.ejs", { hideNavbar: true });
};

module.exports.signUp = async (req, res, next) => {
    try {
        const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body.password === "string" ? req.body.password : "";
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
            req.flash("error", "Use a username with 3–30 letters, numbers, or underscores.");
            return res.redirect("/signup");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            req.flash("error", "Enter a valid email address.");
            return res.redirect("/signup");
        }
        if (password.length < 12 || password.length > 128) {
            req.flash("error", "Use a password between 12 and 128 characters.");
            return res.redirect("/signup");
        }

        const newUser = new User({ email, username, emailVerified: false });
        const registeredUser = await User.register(newUser, password);
        let emailSent = true;
        try {
            await issueEmailVerification(registeredUser);
        } catch (emailError) {
            emailSent = false;
            console.error("Email verification could not be sent:", emailError.message);
        }
        res.render("users/verifyEmail.ejs", { hideNavbar: true, email, emailSent });
    } catch (err) {
        if (res.headersSent) return next(err);
        if (err.name === "UserExistsError" || err.code === 11000) {
            req.flash("error", "That username or email is already registered. Try signing in or use different details.");
        } else {
            console.error("Account creation failed:", err.message);
            req.flash("error", "We couldn’t create your account. Check your details and try again.");
        }
        res.redirect("/signup");
    }
};

module.exports.showLogin = (req, res) => {
    res.render("users/login.ejs", { hideNavbar: true });
};

module.exports.showEmailVerification = (req, res) => {
    res.render("users/verifyEmail.ejs", { hideNavbar: true, email: "", emailSent: null });
};

module.exports.verifyEmail = async (req, res) => {
    const user = await verifyEmailToken(req.query.token);
    if (!user) {
        req.flash("error", "That verification link is invalid or expired. Request a new one below.");
        return res.redirect("/verify-email");
    }
    req.flash("success", "Email verified. You can now sign in.");
    res.redirect("/login");
};

module.exports.resendVerificationEmail = async (req, res) => {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const user = await User.findOne({ email, emailVerified: false });
        if (user) {
            try {
                await issueEmailVerification(user);
            } catch (err) {
                console.error("Email verification could not be sent:", err.message);
            }
        }
    }
    req.flash("success", "If an unverified account exists for that email, a new verification link will arrive shortly.");
    res.redirect("/verify-email");
};

module.exports.showProfile = async (req, res) => {
    const [hostedListings, hostedListingCount, savedStayCount] = await Promise.all([
        Listing.find({ owner: req.user._id }).sort({ _id: -1 }),
        Listing.countDocuments({ owner: req.user._id }),
        Listing.countDocuments({ _id: { $in: req.user.wishlist || [] } })
    ]);
    res.render("users/profile.ejs", {
        profileUser: req.user,
        hostedListings,
        hostedListingCount,
        savedStayCount
    });
};

module.exports.updateProfilePhoto = async (req, res) => {
    if (!req.file) throw new ExpressError(400, "Choose a profile photo to upload.");

    let updatedUser;
    try {
        updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { profileImage: { url: req.file.path, fileName: req.file.filename } },
            { new: true, runValidators: true }
        );
    } catch (err) {
        try {
            await cloudinary.uploader.destroy(req.file.filename);
        } catch (cleanupError) {
            console.error("Could not remove an unused profile upload:", cleanupError.message);
        }
        throw err;
    }

    if (!updatedUser) {
        await cloudinary.uploader.destroy(req.file.filename);
        throw new ExpressError(404, "User account not found.");
    }

    if (req.user.profileImage?.fileName) {
        try {
            await cloudinary.uploader.destroy(req.user.profileImage.fileName);
        } catch (err) {
            console.error("Could not remove the previous profile photo:", err.message);
        }
    }
    req.flash("success", "Profile photo updated.");
    res.redirect("/profile");
};

module.exports.Login = (req, res) => {
    req.flash("success", "Welcome back to Wanderlust! You are logged in.");
    const candidate = req.session.redirectUrl || res.locals.redirectUrl || "/listings";
    let redirectUrl = "/listings";
    if (typeof candidate === "string" && candidate.startsWith("/") && !candidate.startsWith("//")) {
        try {
            const parsed = new URL(candidate, "http://wanderlust.local");
            if (parsed.origin === "http://wanderlust.local") {
                redirectUrl = `${parsed.pathname}${parsed.search}${parsed.hash}`;
            }
        } catch { /* use the safe default */ }
    }
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out");
        res.redirect("/listings");
    });
};
