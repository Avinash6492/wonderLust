const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const { cloudinary } = require("./cloudConfig.js");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl; 
        req.flash("error", "you must be logged in ti create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};


module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        if (!listing.owner || !listing.owner.equals(req.user._id)) {
            req.flash("error", "You don't have permission to edit this listing!");
            return res.redirect(`/listings/${id}`);
        }

        // The owner is authorized; continue to the edit route
        next();

    } catch (err) {
        next(err);
    }
};

// Server-side listing validation
module.exports.validateListing = async (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        if (req.file?.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cleanupError) {
                console.error("Could not remove an invalid listing upload:", cleanupError.message);
            }
        }
        const errMsg = error.details
            .map((el) => el.message)
            .join(",");

        return next(new ExpressError(400, errMsg));
    }

    next();
};

// Review validation middleware
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errMsg = error.details
            .map((el) => el.message)
            .join(",");

        return next(new ExpressError(400, errMsg));
    }

    next();
};

module.exports.isReviewAuthor = async (req,res,next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if (!review || !review.author) {
        return next(new ExpressError(404, "Review not found"));
    }
    const belongsToListing = await Listing.exists({ _id: id, reviews: reviewId });
    if (!belongsToListing) {
        return next(new ExpressError(404, "Review not found"));
    }
    if(!review.author.equals(req.user._id)) {
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
