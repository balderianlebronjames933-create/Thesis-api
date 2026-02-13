// routes/organization.js
const express = require("express");
const router = express.Router();
const orgController = require("../controllers/orgController");
const { verify, verifyAdmin } = require("../auth");
const storage = require("../config/cloudinary");
const multer = require("multer");
const upload = multer({ storage });

const uploadFields = upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'orgChart', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'gallery', maxCount: 10 } // Allow up to 10 images at once
]);

// --- PUBLIC ROUTES ---
// Students/Guests see only isActive: true
router.get("/", orgController.getAllOrgs); 
router.get("/:id", orgController.getOrg);

// --- ADMIN ROUTES ---
// 1. The "Dashboard" list (Shows active & inactive)
router.get("/admin/list", verify, verifyAdmin, orgController.getAdminOrgList);

// 2. Management Actions
router.post("/", verify, verifyAdmin, uploadFields, orgController.createOrg);
// Update the route to use this new middleware
router.patch("/:id", verify, verifyAdmin, uploadFields, orgController.updateOrg);
router.delete("/:id", verify, verifyAdmin, orgController.deleteOrg);
router.patch("/status/:id", verify, verifyAdmin, orgController.toggleOrgStatus);
router.delete("/:id/gallery/:imageId", verify, verifyAdmin, orgController.deleteGalleryItem);

module.exports = router;