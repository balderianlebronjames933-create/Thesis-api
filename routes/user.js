const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { verify } = require("../auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/details", verify, userController.getDetails);

module.exports = router;