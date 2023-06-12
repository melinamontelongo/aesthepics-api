const multer = require("multer");

const cloudinary = require("cloudinary").v2;

const { CloudinaryStorage } = require("multer-storage-cloudinary");

const { CLOUDINARY_HOST, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUDINARY_HOST,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "pictures",
        format: async () => "png",
    },
});

exports.parser = multer({ storage: storage });

exports.deleteDbPic = (req, res, next) => {
    const pic = req.params.publicID;
    if (pic) {
        cloudinary.uploader.destroy(`pictures/${pic}`, {resource_type: "image"}, function (err, result) { console.log(result) });
        next();
    } else {
        res.sendStatus(401);
    };
};