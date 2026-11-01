const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Reviews = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  image: {
   url: String,
   fileName: String
    },
    
  price: { type: Number, required: true, min: 0 },
  location: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ["Beachfront", "Mountains", "Countryside", "Amazing views", "Budget stays", "Other"],
    default: "Other"
  },
  reviews:[
    {
    type : Schema.Types.ObjectId,
    ref: "Review", 
     },
  ],
  owner:{
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  geometry:{
    type:{
      type: String,
      enum: ['Point'],//location.type must be "Point"
      required: true
    },
    coordinates:{
      type: [Number],
      required: true
    }
  }
});


listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
        await Reviews.deleteMany({_id: {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
