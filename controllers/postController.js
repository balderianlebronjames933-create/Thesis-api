const Post = require("../models/Post");
const Comment = require("../models/Comment");

// CREATE
exports.createPost = async (req, res) => {
    try {
        const { title, content, type, eventDate, location, organizationId, isFeatured } = req.body;

        // Handle tags: convert "news, sports, academic" into ["news", "sports", "academic"]
        let processedTags = [];
        if (req.body.tags) {
            processedTags = req.body.tags.split(',').map(tag => tag.trim().toLowerCase());
        }

        const image = req.file ? req.file.path : "";

        const newPost = new Post({
            title, content, type, image, eventDate, location,
            organization: organizationId && organizationId.trim() !== "" ? organizationId : undefined,
            author: req.user.id,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            tags: processedTags
        });

        await newPost.save();
        res.status(201).json({ message: "Post created successfully", newPost });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ (All Posts) 
exports.getAllPosts = async (req, res) => {
    try {
        // Default: Only show active posts
        let query = { isActive: true };

        // Only show everything if the user IS logged in AND IS an admin
        if (req.user && req.user.isAdmin) {
            query = {};
        }

        const posts = await Post.find(query)
            .populate("author", "firstName lastName")
            .populate("organization", "name logo")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET SINGLE POST
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author", "firstName lastName");

        if (!post) return res.status(404).json({ error: "Post not found" });

        // Security check: If post is hidden and user is NOT an admin, block access
        if (!post.isActive && (!req.user || !req.user.isAdmin)) {
            return res.status(403).json({ error: "This post has been hidden by an administrator." });
        }

        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
// Inside updatePost
exports.updatePost = async (req, res) => {
    try {
const { id } = req.params;
        const { organizationId, ...otherFields } = req.body; // Destructure organizationId out
        const updates = { ...otherFields };

        // Handle the "None" organization case for Updates
        if (organizationId === "" || organizationId === null) {
            updates.organization = null; // Tells Mongoose to clear the field
        } else if (organizationId) {
            updates.organization = organizationId;
        }

        // Process tags if they exist in the update request
        if (req.body.tags) {
            updates.tags = req.body.tags.split(',').map(tag => tag.trim().toLowerCase());
        }

        // Handle boolean conversion for isFeatured if sent as string
        if (req.body.isFeatured !== undefined) {
            updates.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
        }

        if (req.file) updates.image = req.file.path;

        const updatedPost = await Post.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedPost) return res.status(404).json({ error: "Post not found" });

        res.status(200).json({ message: "Post updated", updatedPost });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE
exports.deletePost = async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) return res.status(404).json({ error: "Post not found" });

        // NEW: Delete all comments associated with this post ID
        await Comment.deleteMany({ postId: req.params.id });

        res.status(200).json({ message: "Post and associated comments deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// TOGGLE STATUS
exports.togglePostStatus = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Flip the boolean value
        post.isActive = !post.isActive;
        await post.save();

        res.status(200).json({
            message: `Post is now ${post.isActive ? 'Visible' : 'Hidden'}`,
            isActive: post.isActive
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ALL POSTS (Admin version - shows everything)
exports.getAdminPosts = async (req, res) => {
    try {
        const posts = await Post.find({}) // No filters, show all
            .populate("author", "firstName lastName")
            .populate("organization", "name logo")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};