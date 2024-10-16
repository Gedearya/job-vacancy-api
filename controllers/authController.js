const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register
exports.register = async (req, res) => {
  const { name, email, password, image_url } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Validate password length
    if (password.length < 8) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 8 characters long" });
    }

    // Create new user
    user = new User({ name, email, password, image_url });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image_url: user.image_url,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Remove password from user object
    user.password = undefined;

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image_url: user.image_url,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { userId, currentPassword, newPassword, newConfirmPassword } = req.body;

  try {
    // Detailed input validation
    if (!userId) {
      return res.status(400).json({ msg: "User ID is required" });
    }
    if (!currentPassword) {
      return res.status(400).json({ msg: "Current password is required" });
    }
    if (!newPassword) {
      return res.status(400).json({ msg: "New password is required" });
    }
    if (!newConfirmPassword) {
      return res.status(400).json({ msg: "Password confirmation is required" });
    }

    if (newPassword !== newConfirmPassword) {
      return res.status(400).json({ msg: "New passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ msg: "New password must be at least 8 characters long" });
    }

    // Find user by ID
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ msg: "User not found", userId });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save updated user
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);

    // More detailed error responses
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ msg: "Validation error", details: error.errors });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ msg: "Invalid user ID format", userId });
    }
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ msg: "Duplicate key error", details: error.keyValue });
    }

    res.status(500).json({
      msg: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
    });
  }
};
