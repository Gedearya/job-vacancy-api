const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  job_description: { type: String, required: true },
  job_qualification: { type: String, required: true },
  job_type: { type: String, required: true },
  job_tenure: { type: String, required: true },
  job_status: { type: Number, required: true }, // 0: closed, 1: open
  company_name: { type: String, required: true },
  company_image_url: { type: String },
  company_city: { type: String, required: true },
  salary_min: { type: Number, required: true },
  salary_max: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
