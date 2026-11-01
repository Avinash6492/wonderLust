const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET_KEY,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "wanderlust_DEV",
        allowed_formats: ["png", "jpg", "jpeg"],
    },
});

const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "wanderlust_DEV/profiles",
        allowed_formats: ["png", "jpg", "jpeg"],
    },
});

module.exports = {
    cloudinary,
    storage,
    profileStorage,
};
