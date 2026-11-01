
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middelware.js");
const listingController = require("../controllers/listings.js")
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Index Route: GET /listings
router.get("/", wrapAsync(listingController.index));

// New Listing Route: GET /listings/new
// Keep this before /:id
router.get("/new", isLoggedIn, listingController.newListingForm );

// Create Route: POST /listings
router.post(
    "/",
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
);

// Edit Route: GET /listings/:id/edit
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingController.editListing));

// Update Route: PUT /listings/:id
router.put("/:id",isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListings));

// Delete Route: DELETE /listings/:id
router.delete("/:id",isLoggedIn, isOwner, wrapAsync(listingController.destroyListings));

// Show Route: GET /listings/:id
router.get("/:id", wrapAsync(listingController.showListings));

module.exports = router;
