if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const MONGO_URL = process.env.MONGO_URL?.trim();

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listings.js");
const reviews = require("./routes/reviews.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");
const wishlistRouter = require("./routes/wishlist.js");

if (!process.env.SECRET) {
    throw new Error("Missing required SECRET environment variable");
}
if (!MONGO_URL) {
    throw new Error("Missing required MONGO_URL environment variable. Add it to your .env file.");
}

const sessionOpts = {
    secret: process.env.SECRET,
    store: MongoStore.create({
        mongoUrl: MONGO_URL,
        collectionName: "sessions",
        ttl: 7 * 24 * 60 * 60,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    },
};



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.json({ limit: "20kb" }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.use(session(sessionOpts));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//Demo User
// app.get("/demouser", async (req,res)=>{
// let fakeUser= new User({
//     email: "student@gmail.com",
//     username: "Alpha@_108",
// });
// let newRegisterUser= await User.register(fakeUser, "Avi_108");
// res.send(newRegisterUser);
// });

// Listing routes
app.use("/listings", listings);
// Review routes
app.use("/listings/:id/reviews", reviews);
app.use("/wishlist", wishlistRouter);
app.use("/", userRouter);

// Root route
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Catch-all 404 route (Express 5)
app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || (err.code === "LIMIT_FILE_SIZE" ? 413 : 500);
    const message = err.statusCode
        ? err.message
        : statusCode === 413
            ? "The image is too large. Please upload an image under 5 MB."
            : "Something went wrong. Please try again.";

    if (statusCode >= 500 && statusCode !== 502 && statusCode !== 503) {
        console.error(err);
    }

    res.locals.error = [message];

    res.status(statusCode).render("error.ejs", { message });
});

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log("Connected to DB");
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server live on port ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err.message);
        process.exitCode = 1;
    });
