const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");

const requireApiLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Please log in to sync your saved stays." });
    }
    next();
};

const getWishlistIds = async (userId) => {
    const user = await User.findById(userId).select("wishlist");
    return (user?.wishlist || []).map((id) => String(id));
};

router.put("/", requireApiLogin, wrapAsync(async (req, res) => {
    const submittedIds = Array.isArray(req.body.ids) ? req.body.ids.slice(0, 100) : [];
    const validIds = [...new Set(submittedIds.filter((id) => mongoose.isValidObjectId(id)).map(String))];
    const existingListings = await Listing.find({ _id: { $in: validIds } }).select("_id");
    const existingIds = existingListings.map((listing) => listing._id);

    if (existingIds.length) {
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { wishlist: { $each: existingIds } }
        });
    }

    res.json({ ids: await getWishlistIds(req.user._id) });
}));

router.post("/:listingId", requireApiLogin, wrapAsync(async (req, res) => {
    const { listingId } = req.params;
    if (!mongoose.isValidObjectId(listingId)) {
        return res.status(400).json({ message: "Invalid listing id." });
    }
    if (!await Listing.exists({ _id: listingId })) {
        return res.status(404).json({ message: "Listing not found." });
    }

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: listingId } });
    res.json({ ids: await getWishlistIds(req.user._id) });
}));

router.delete("/:listingId", requireApiLogin, wrapAsync(async (req, res) => {
    const { listingId } = req.params;
    if (!mongoose.isValidObjectId(listingId)) {
        return res.status(400).json({ message: "Invalid listing id." });
    }

    await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: listingId } });
    res.json({ ids: await getWishlistIds(req.user._id) });
}));

module.exports = router;
