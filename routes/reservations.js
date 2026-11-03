const express = require("express");
const { rateLimit } = require("express-rate-limit");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middelware.js");
const reservationController = require("../controllers/reservations.js");

const reservationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: "Too many reservation requests. Please try again later."
});

router.post("/listings/:listingId/reservations", isLoggedIn, reservationLimiter, wrapAsync(reservationController.create));
router.get("/reservations/:id/payment", isLoggedIn, wrapAsync(reservationController.paymentPage));

module.exports = router;
