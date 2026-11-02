if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const crypto = require("crypto");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
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
const pagesRouter = require("./routes/pages.js");

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

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://api.mapbox.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://api.mapbox.com"],
            connectSrc: ["'self'", "https://api.mapbox.com", "https://events.mapbox.com", "https://*.tiles.mapbox.com", "https://api.frankfurter.dev"],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["'self'", "blob:"]
        }
    }
}));

app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.json({ limit: "20kb" }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.use(session(sessionOpts));

app.use((req, res, next) => {
    if (["/login", "/signup"].includes(req.path) || req.path.startsWith("/verify-email")) {
        if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString("hex");
        res.locals.csrfToken = req.session.csrfToken;
    }
    next();
});

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
app.use((req, res, next) => {
    const origin = req.get("origin");
    if (!unsafeMethods.has(req.method) || !origin) return next();

    const publicUrl = process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL;
    let expectedOrigin;
    try {
        expectedOrigin = new URL(publicUrl || `${req.protocol}://${req.get("host")}`).origin;
    } catch {
        expectedOrigin = new URL(`${req.protocol}://${req.get("host")}`).origin;
    }

    let requestOrigin;
    try {
        requestOrigin = new URL(origin).origin;
    } catch {
        const expectedToken = req.session?.csrfToken;
        const submittedToken = req.body?._csrf;
        const tokenIsValid = typeof expectedToken === "string" &&
            typeof submittedToken === "string" &&
            expectedToken.length === submittedToken.length &&
            crypto.timingSafeEqual(Buffer.from(expectedToken), Buffer.from(submittedToken));
        if (tokenIsValid) return next();

        try {
            requestOrigin = new URL(req.get("referer")).origin;
        } catch {
            return res.status(403).send("Invalid request origin.");
        }
    }

    if (requestOrigin !== expectedOrigin) {
        return res.status(403).send("Cross-origin request blocked.");
    }
    next();
});
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
app.use("/", pagesRouter);
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
