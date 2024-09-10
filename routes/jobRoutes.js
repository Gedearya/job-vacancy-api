const express = require("express");
const {
  getJobs,
  getJobById, // Tambahkan ini untuk job by ID
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// Rute untuk mendapatkan semua pekerjaan (public, tidak memerlukan autentikasi)
router.get("/", getJobs);

// Rute untuk mendapatkan pekerjaan berdasarkan ID (public, tidak memerlukan autentikasi)
router.get("/:id", getJobById); // Tambahkan ini

// Rute untuk membuat pekerjaan baru (hanya bisa diakses jika sudah login)
router.post("/", auth, createJob);

// Rute untuk memperbarui pekerjaan berdasarkan ID (hanya bisa diakses jika sudah login)
router.put("/:id", auth, updateJob);

// Rute untuk menghapus pekerjaan berdasarkan ID (hanya bisa diakses jika sudah login)
router.delete("/:id", auth, deleteJob);

module.exports = router;
