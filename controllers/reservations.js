const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Reservation = require("../models/reservation.js");
const ExpressError = require("../utils/ExpressError.js");
const { sendReservationRequestEmail } = require("../utils/email.js");

const parseDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
};

module.exports.create = async (req, res) => {
    const { listingId } = req.params;
    if (!mongoose.isValidObjectId(listingId)) throw new ExpressError(404, "Stay not found.");

    const listing = await Listing.findById(listingId).populate("owner");
    if (!listing) throw new ExpressError(404, "Stay not found.");
    if (listing.owner?._id?.equals(req.user._id)) {
        throw new ExpressError(400, "You can’t request a stay at your own listing.");
    }
    if (listing.owner?.accountClosedAt) {
        throw new ExpressError(409, "This stay is not accepting reservation requests right now.");
    }

    const checkIn = parseDate(req.body.checkIn);
    const checkOut = parseDate(req.body.checkOut);
    const guestCount = Number(req.body.guests);
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    if (!checkIn || !checkOut || checkIn < today || checkOut <= checkIn) {
        throw new ExpressError(400, "Choose valid dates, with check-out after check-in.");
    }
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 16) {
        throw new ExpressError(400, "Choose between 1 and 16 guests.");
    }

    const nights = (checkOut.getTime() - checkIn.getTime()) / 86400000;
    if (!Number.isInteger(nights) || nights > 365) {
        throw new ExpressError(400, "A stay can be between 1 and 365 nights.");
    }

    const nightlyPrice = Number(listing.price);
    if (!Number.isFinite(nightlyPrice) || nightlyPrice < 0) {
        throw new ExpressError(400, "This stay’s price is unavailable.");
    }
    const subtotal = Math.round(nightlyPrice * nights);
    if (!Number.isSafeInteger(subtotal)) {
        throw new ExpressError(400, "This stay’s total is outside the supported price range.");
    }
    const reservation = await Reservation.create({
        guest: req.user._id,
        listing: listing._id,
        listingTitle: listing.title,
        listingLocation: `${listing.location}, ${listing.country}`,
        checkIn,
        checkOut,
        guestCount,
        nights,
        nightlyPrice,
        subtotal,
        status: "awaiting_payment",
        paymentStatus: "not_started"
    });

    try {
        await sendReservationRequestEmail(req.user.email, reservation);
        reservation.requestEmailAcceptedAt = new Date();
        await reservation.save();
    } catch (error) {
        console.error("Reservation request email could not be sent:", error.message);
    }

    res.redirect(`/reservations/${reservation._id}/payment`);
};

module.exports.paymentPage = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ExpressError(404, "Reservation not found.");
    const reservation = await Reservation.findOne({ _id: req.params.id, guest: req.user._id });
    if (!reservation) throw new ExpressError(404, "Reservation not found.");
    res.render("reservations/payment.ejs", {
        reservation,
        emailSent: Boolean(reservation.requestEmailAcceptedAt)
    });
};
