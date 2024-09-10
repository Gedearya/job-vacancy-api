const express = require("express");
const {
  register,
  login,
  changePassword,
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/change-password", auth, changePassword);

module.exports = router;
