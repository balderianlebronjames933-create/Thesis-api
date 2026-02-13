const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { verify, verifyAdmin } = require("../auth");

// Add comment
router.post("/addComment", verify, commentController.addComment);

// Get comments for a specific post
router.get("/getComments/:postId", verify, commentController.getCommentsByPost);

// Edit own comment
router.patch("/updateComment/:id", verify, commentController.updateComment);

// Delete own comment (Standard user)
router.delete("/deleteComment/:id", verify, commentController.deleteComment);

// Admin moderation delete (Admin only)
router.delete("/adminDeleteComment/:id", verify, verifyAdmin, commentController.adminDeleteComment);

module.exports = router;