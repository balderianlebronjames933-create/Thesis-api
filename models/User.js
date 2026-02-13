const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true }, // Added
    lastName: { type: String, required: true },  // Added
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
});
module.exports = mongoose.model("User", userSchema);
