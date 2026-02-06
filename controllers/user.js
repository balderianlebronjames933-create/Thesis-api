const bcrypt = require("bcrypt");
const User = require("../models/User");
const { createAccessToken } = require("../auth");

exports.register = async (req, res) => {
    try {
        const { email, password, isAdmin } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ email, password: hashedPassword, isAdmin });
        await user.save();
        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

        const access = createAccessToken(user);
        res.status(200).json({ access });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
