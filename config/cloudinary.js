// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// LOG TO CHECK CONNECTION SETTINGS
console.log("Cloudinary Configured: ", {
    cloud_name: cloudinary.config().cloud_name,
    api_key: cloudinary.config().api_key ? "PRESENT" : "MISSING"
});

// 2. Set up the storage engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'university_portal', // Images will be saved in this folder
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

module.exports = storage;