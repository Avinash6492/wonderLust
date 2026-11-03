
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl, isLoggedIn} = require("../middelware.js");
const userController = require("../controllers/user.js");
const multer = require("multer");
const { rateLimit } = require("express-rate-limit");
const createCloudinaryStorage = require("../utils/cloudinaryStorage.js");
const profileStorage = createCloudinaryStorage("wanderlust_DEV/profiles");
const profileUpload = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: "Too many sign-in attempts. Please wait 15 minutes and try again."
});
const verificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: "Too many verification requests. Please wait and try again."
});

// Show signup page
router.get("/signup",userController.showSignUp );

router.post("/signup", authLimiter, wrapAsync(userController.signUp));

// show login page
router.get("/login", userController.showLogin);

router.get("/verify-email", userController.showEmailVerification);
router.get("/verify-email/confirm", verificationLimiter, wrapAsync(userController.verifyEmail));
router.get("/verify-email/resend", userController.showEmailVerification);
router.post("/verify-email/resend", verificationLimiter, wrapAsync(userController.resendVerificationEmail));
router.get("/verify-email/pending", userController.showEmailVerification);

router.get("/profile", isLoggedIn, wrapAsync(userController.showProfile));

router.post("/profile/photo", isLoggedIn, profileUpload.single("profileImage"), wrapAsync(userController.updateProfilePhoto));
router.post("/account/close", isLoggedIn, authLimiter, wrapAsync(userController.closeAccount));

// Login
router.post(
    "/login",
    authLimiter,
    saveRedirectUrl,
    (req, res, next) => {
        passport.authenticate("local", (err, user) => {
            if (err) return next(err);
            if (!user) {
                req.flash("error", "The username or password is incorrect.");
                return res.redirect("/login");
            }
            if (user.accountClosedAt) {
                req.flash("error", "This account is closed. Your account data has been retained.");
                return res.redirect("/login");
            }
            if (user.emailVerified === false) {
                req.flash("error", "Verify your email before signing in. You can request a new link below.");
                return res.redirect("/verify-email");
            }
            req.logIn(user, (loginError) => {
                if (loginError) return next(loginError);
                return userController.Login(req, res);
            });
        })(req, res, next);
    }
);

router.post("/logout",userController.logout);

module.exports = router;
