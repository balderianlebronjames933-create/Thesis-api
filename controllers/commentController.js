const Comment = require("../models/Comment");

// CREATE: Add a new comment
exports.addComment = async (req, res) => {
    try {
        const newComment = new Comment({
            text: req.body.text,
            postId: req.body.postId,
            userId: req.user.id
        });
        const savedComment = await newComment.save();
        res.status(201).json(await savedComment.populate("userId", "firstName lastName"));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ: Get comments for a post
exports.getCommentsByPost = async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId })
            .populate("userId", "firstName lastName")
            .sort({ createdAt: 1 });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE: Edit comment (Owner only)
exports.updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        if (comment.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        comment.text = req.body.text;
        await comment.save();
        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE: Regular User (Must own the comment)
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        if (comment.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized: You can only delete your own comments." });
        }

        await comment.deleteOne();
        res.status(200).json({ message: "Comment deleted by owner." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ADMIN DELETE: Moderator (Can delete any comment)
exports.adminDeleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        // No ownership check needed; verifyAdmin middleware handles the role check
        await comment.deleteOne();
        res.status(200).json({ message: "Comment permanently removed by Admin." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};