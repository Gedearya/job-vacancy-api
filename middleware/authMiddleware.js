const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Ambil token dari header "authorization"
  const token = req.header("authorization");

  // Cek jika token tidak ada atau formatnya tidak benar
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Pisahkan "Bearer" dan token sebenarnya
    const actualToken = token.split(" ")[1];

    // Verifikasi token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    // Simpan decoded user ID di req.user
    req.user = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Invalid token" });
  }
};
