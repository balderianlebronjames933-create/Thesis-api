const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    logo: { type: String },
    fbPageLink: { type: String },
    isActive: { type: Boolean, default: true }, // Status field

    // New field for the Org Chart image
    orgChart: { type: String, default: "" },

    // New array for Gallery/Timeline
    // Storing as an object allows for captions or dates
    gallery: [{
        imageUrl: String,
        caption: String,
        date: Date, // Useful for the "Timeline" aspect
        publicId: String // Good for easier deletion from Cloudinary later
    }],

    banner: {
        type: String,
        default: '' // Or a placeholder image URL
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', organizationSchema);