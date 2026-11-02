const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        trim: true,
        lowercase: true,
    },
    // Existing accounts remain usable; sign-up explicitly marks new accounts false.
    emailVerified: { type: Boolean, default: true },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpiresAt: { type: Date, select: false },
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: "Listing"
    }],
    profileImage: {
        url: String,
        fileName: String
    },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);
