const Organization = require("../models/Organization");

// CREATE
exports.createOrg = async (req, res) => {
    try {
        const { name, description, fbPageLink } = req.body;

        // Use req.files instead of req.file
        const logo = req.files['logo'] ? req.files['logo'][0].path : "";
        const orgChart = req.files['orgChart'] ? req.files['orgChart'][0].path : "";
        const banner = req.files['banner'] ? req.files['banner'][0].path : "";

        const newOrg = new Organization({
            name,
            description,
            fbPageLink,
            logo,
            orgChart, // Add this
            banner
        });

        await newOrg.save();
        res.status(201).json(newOrg);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ (All)
exports.getAllOrgs = async (req, res) => {
    try {
        // Only show active orgs to the public
        const orgs = await Organization.find({ isActive: true }).sort({ name: 1 });
        res.status(200).json(orgs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET SINGLE ORGANIZATION
exports.getOrg = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id);
        if (!org) return res.status(404).json({ error: "Organization not found" });

        // If it's hidden, don't show it on the public route at all
        if (!org.isActive) {
            return res.status(403).json({ error: "This organization profile is currently inactive." });
        }

        res.status(200).json(org);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
exports.updateOrg = async (req, res) => {
    try {
        const updates = { ...req.body };

        // Handle Logo & Org Chart by adding them to the 'updates' object
        if (req.files['logo']) updates.logo = req.files['logo'][0].path;
        if (req.files['orgChart']) updates.orgChart = req.files['orgChart'][0].path;
        if (req.files['banner']) {  updates.banner = req.files['banner'][0].path;
            // Note: adjust '.path' depending on if you're using Cloudinary or local storage
        }

        // Build the final query object
        const finalQuery = { $set: updates };

        // Handle Gallery (Pushing new items to the existing array)
        if (req.files['gallery']) {
            const newImages = req.files['gallery'].map(file => ({
                imageUrl: file.path,
                publicId: file.filename, // Added for Cloudinary management
                caption: req.body.caption || "",
                date: new Date()
            }));
            finalQuery.$push = { gallery: { $each: newImages } };
        }

        const updatedOrg = await Organization.findByIdAndUpdate(
            req.params.id,
            finalQuery, // Use the query that has both $set and $push
            { new: true, runValidators: true }
        );

        if (!updatedOrg) return res.status(404).json({ error: "Org not found" });
        res.status(200).json(updatedOrg);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE
exports.deleteOrg = async (req, res) => {
    try {
        const deleted = await Organization.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Org not found" });
        res.status(200).json({ message: "Organization deleted permanently." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteGalleryItem = async (req, res) => {
    try {
        const { id, imageId } = req.params;
        await Organization.findByIdAndUpdate(id, {
            $pull: { gallery: { _id: imageId } }
        });
        res.status(200).json({ message: "Image removed from gallery" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// TOGGLE STATUS (Show/Hide Organization)
exports.toggleOrgStatus = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id);
        if (!org) return res.status(404).json({ error: "Organization not found" });

        // Flip the boolean
        org.isActive = !org.isActive;
        await org.save();

        res.status(200).json({
            message: `Organization is now ${org.isActive ? 'Active' : 'Inactive'}`,
            isActive: org.isActive
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ADMIN ONLY: Get every organization regardless of status
exports.getAdminOrgList = async (req, res) => {
    try {
        const orgs = await Organization.find().sort({ name: 1 });
        res.status(200).json(orgs);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch admin list: " + err.message });
    }
};