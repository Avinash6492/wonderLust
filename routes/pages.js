const express = require("express");
const router = express.Router();

router.get("/privacy", (req, res) => {
    res.render("pages/privacy.ejs");
});

router.get("/terms", (req, res) => {
    res.render("pages/terms.ejs");
});

router.get("/company", (req, res) => {
    res.render("pages/company.ejs", { supportEmail: process.env.SUPPORT_EMAIL || "" });
});

module.exports = router;
