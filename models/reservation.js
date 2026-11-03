const mongoose = require("mongoose");
const { Schema } = mongoose;

const reservationSchema = new Schema({
    guest: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    listingTitle: { type: String, required: true, trim: true },
    listingLocation: { type: String, required: true, trim: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guestCount: { type: Number, min: 1, max: 16, required: true },
    nights: { type: Number, min: 1, required: true },
    nightlyPrice: { type: Number, min: 0, required: true },
    currency: { type: String, enum: ["INR"], default: "INR", required: true },
    subtotal: { type: Number, min: 0, required: true },
    status: { type: String, enum: ["awaiting_payment", "cancelled"], default: "awaiting_payment", index: true },
    paymentStatus: { type: String, enum: ["not_started"], default: "not_started" },
    requestEmailAcceptedAt: { type: Date, default: null }
}, { timestamps: true });

reservationSchema.index({ guest: 1, createdAt: -1 });

module.exports = mongoose.model("Reservation", reservationSchema);
