const { cloudinary } = require("../cloudConfig.js");

module.exports = (folder) => ({
    _handleFile(req, file, callback) {
        let completed = false;
        const finish = (error, info) => {
            if (completed) return;
            completed = true;
            callback(error, info);
        };

        const upload = cloudinary.uploader.upload_stream({
            folder,
            resource_type: "image",
            allowed_formats: ["png", "jpg", "jpeg"]
        }, (error, result) => {
            if (error) return finish(error);
            finish(null, {
                path: result.secure_url,
                filename: result.public_id,
                size: result.bytes,
                mimetype: file.mimetype,
                format: result.format
            });
        });

        file.stream.once("error", (error) => {
            upload.destroy(error);
            finish(error);
        });
        upload.once("error", finish);
        file.stream.pipe(upload);
    },

    _removeFile(req, file, callback) {
        if (!file.filename) return callback(null);
        cloudinary.uploader.destroy(file.filename, { resource_type: "image" })
            .then(() => callback(null))
            .catch(callback);
    }
});
