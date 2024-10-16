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
// In your changePassword function in the backend
exports.changePassword = async (req, res) => {
  const { userId, currentPassword, newPassword, newConfirmPassword } = req.body;

  try {
    console.log(`Attempting to change password for user: ${userId}`);

    // Validate input
    if (!userId || !currentPassword || !newPassword || !newConfirmPassword) {
      console.log("Missing required fields");
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Find user
    const user = await User.findById(userId).select("+password");
    if (!user) {
      console.log(`User not found: ${userId}`);
      return res.status(404).json({ msg: "User not found" });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log("Current password is incorrect");
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log(`Password successfully changed for user: ${userId}`);
    res.json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
