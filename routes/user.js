
const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl, isLoggedIn} = require("../middelware.js");
const userController = require("../controllers/user.js");
const multer = require("multer");
const { profileStorage } = require("../cloudConfig.js");
const profileUpload = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// Show signup page
router.get("/signup",userController.showSignUp );

router.post("/signup", wrapAsync(userController.signUp));

// show login page
router.get("/login", userController.showLogin);

router.get("/profile", isLoggedIn, wrapAsync(userController.showProfile));

router.post("/profile/photo", isLoggedIn, profileUpload.single("profileImage"), wrapAsync(userController.updateProfilePhoto));

// Login
router.post(
    "/login",saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
  userController.Login
);

router.get("/logout",userController.logout);

module.exports = router;
