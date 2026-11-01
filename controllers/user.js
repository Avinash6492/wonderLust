const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const { cloudinary } = require("../cloudConfig.js");

module.exports.showSignUp = (req, res) => {
    res.render("users/signUp.ejs", { hideNavbar: true });
};

module.exports.signUp = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Account created. Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (err) {
        if (res.headersSent) return next(err);
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

module.exports.showLogin = (req, res) => {
    res.render("users/login.ejs", { hideNavbar: true });
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
    const redirectUrl = req.session.redirectUrl || res.locals.redirectUrl || "/listings";
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
