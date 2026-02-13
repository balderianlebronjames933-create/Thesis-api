// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['news', 'event'], // Distinguishes the post
        required: true 
    },
    image: { type: String }, // Cloudinary URL
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    tags: [{ 
        type: String 
    }],
    isFeatured: {
        type: Boolean,
        default: false
    },
    // Specific to Events
    eventDate: { type: Date },
    location: { type: String },
    organization: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Organization' 
    },
    createdAt: { type: Date, default: Date.now },

    isActive: { 
        type: Boolean, 
        default: true 
    }
});

module.exports = mongoose.model('Post', postSchema);