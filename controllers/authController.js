const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register
exports.register = async (req, res) => {
  const { name, email, password, image_url } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({ name, email, password, image_url });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Cocokkan password yang diinput dengan password yang di-hash di database
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Buat token JWT
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Hapus password dari user object sebelum mengirimnya ke frontend
    user.password = undefined;

    // Mengirimkan token dan detail user sebagai respons
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
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ msg: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ msg: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
