const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const { cloudinary } = require("../cloudConfig.js");

const listingCategories = ["Beachfront", "Mountains", "Countryside", "Amazing views", "Budget stays", "Other"];

const geocodeLocation = async (location, country) => {
    if (!process.env.MAP_BOX) {
        throw new ExpressError(503, "Location lookup is not configured. Please try again later.");
    }

    const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_BOX });
    const response = await geocodingClient.forwardGeocode({
        query: `${location}, ${country}`,
        limit: 1,
    }).send();
    const geometry = response.body.features?.[0]?.geometry;
    if (!geometry) {
        throw new ExpressError(400, "We couldn't find that location. Check the location and country, then try again.");
    }
    return geometry;
};

const removeUploadedImage = async (file) => {
    if (!file?.filename) return;
    try {
        await cloudinary.uploader.destroy(file.filename);
    } catch (err) {
        console.error("Could not remove an unused uploaded image:", err.message);
    }
};

module.exports.index = async (req, res) => {
    const { location, category, wishlist } = req.query;
    const locationQuery = typeof location === "string" ? location.trim() : "";
    const selectedCategory = typeof category === "string" ? category : "";

    if (wishlist === "1") {
        if (!req.user) {
            req.session.redirectUrl = req.originalUrl;
            req.flash("error", "Log in to view your saved stays.");
            return res.redirect("/login");
        }

        const allListings = await Listing.find({ _id: { $in: req.user.wishlist || [] } }).sort({ _id: -1 });
        return res.render("listings/index.ejs", {
            allListings,
            location: "",
            currentCategory: "",
            showWishlist: true
        });
    }

    const filter = {};
    if (selectedCategory && selectedCategory !== "Trending" && listingCategories.includes(selectedCategory)) {
        if (selectedCategory === "Other") {
            filter.$and = [{ $or: [
                { category: "Other" },
                { category: { $exists: false } }
            ] }];
        } else {
            filter.category = selectedCategory;
        }
    }

    if (locationQuery) {
        const searchRegex = new RegExp(locationQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        const locationMatches = { $or: [
            { location: searchRegex },
            { country: searchRegex }
        ] };
        if (filter.$and) filter.$and.push(locationMatches);
        else filter.$or = locationMatches.$or;
    }

    const allListings = selectedCategory === "Trending"
        ? await Listing.aggregate([
            { $match: filter },
            { $addFields: { reviewCount: { $size: { $ifNull: ["$reviews", []] } } } },
            { $sort: { reviewCount: -1, _id: -1 } },
        ])
        : await Listing.find(filter).sort({ _id: -1 });

    res.render("listings/index.ejs", {
        allListings,
        location: locationQuery,
        currentCategory: selectedCategory,
        showWishlist: false
    });
};

module.exports.newListingForm = (req, res) => {
    res.render("listings/new.ejs", { categories: listingCategories });
};

module.exports.createListing = async (req, res) => {
    if (!req.file) throw new ExpressError(400, "Please upload a listing photo.");

    let geometry;
    try {
        geometry = await geocodeLocation(req.body.listing.location, req.body.listing.country);
    } catch (err) {
        await removeUploadedImage(req.file);
        throw err instanceof ExpressError
            ? err
            : new ExpressError(502, "We couldn't look up that location right now. Please try again.");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url: req.file.path, fileName: req.file.filename };
    newListing.geometry = geometry;
    try {
        await newListing.save();
    } catch (err) {
        await removeUploadedImage(req.file);
        throw err;
    }
    req.flash("success", "New listing created");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.render("listings/edit.ejs", { listing, categories: listingCategories });
};

module.exports.updateListings = async (req, res) => {
    const { id } = req.params;
    const listingData = { ...req.body.listing };
    const existingListing = await Listing.findById(id);
    if (!existingListing) throw new ExpressError(404, "Listing not found");

    const updatedListing = { ...listingData };
    if (req.file) {
        updatedListing.image = { url: req.file.path, fileName: req.file.filename };
    }

    if (listingData.location || listingData.country) {
        const nextLocation = listingData.location || existingListing.location;
        const nextCountry = listingData.country || existingListing.country;
        try {
            updatedListing.geometry = await geocodeLocation(nextLocation, nextCountry);
        } catch (err) {
            await removeUploadedImage(req.file);
            throw err instanceof ExpressError
                ? err
                : new ExpressError(502, "We couldn't look up that location right now. Please try again.");
        }
    }

    try {
        await Listing.findByIdAndUpdate(id, updatedListing, { runValidators: true });
    } catch (err) {
        await removeUploadedImage(req.file);
        throw err;
    }

    if (req.file && existingListing.image?.fileName) {
        await removeUploadedImage({ filename: existingListing.image.fileName });
    }
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.showListings = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) throw new ExpressError(404, "Listing not found");
    res.render("listings/show.ejs", {
        listing,
        mapToken: process.env.MAP_BOX,
        coordinates: listing.geometry?.coordinates || null
    });
};

module.exports.destroyListings = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    await User.updateMany({ wishlist: id }, { $pull: { wishlist: id } });
    req.flash("success", "Listing deleted successfully");
    res.redirect("/listings");
};
