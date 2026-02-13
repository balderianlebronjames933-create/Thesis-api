const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { verify, verifyAdmin } = require("../auth");
const storage = require("../config/cloudinary"); // Your Cloudinary config
const multer = require("multer");
const upload = multer({ storage });

// CREATE: Admin only
router.post("/", verify, verifyAdmin, upload.single("image"), postController.createPost);

// READ: All posts (Status logic handled in controller)
router.get("/", postController.getAllPosts);
// READ: All posts (Admin-only view)
router.get("/admin", verify, verifyAdmin, postController.getAdminPosts);

// READ: Single post details 
// Changed to postController.getPost to match your controller file
router.get("/:id", postController.getPost); 


// UPDATE: Admin only
router.patch("/:id", verify, verifyAdmin, upload.single("image"), postController.updatePost);

// DELETE: Admin only
router.delete("/:id", verify, verifyAdmin, postController.deletePost);

// TOGGLE STATUS: Admin only
router.patch("/status/:id", verify, verifyAdmin, postController.togglePostStatus);

module.exports = router;