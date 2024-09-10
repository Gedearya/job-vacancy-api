const Job = require("../models/Job");

// Get All Jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get Job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Create New Job
exports.createJob = async (req, res) => {
  const {
    title,
    job_description,
    job_qualification,
    job_type,
    job_tenure,
    job_status,
    company_name,
    company_image_url,
    company_city,
    salary_min,
    salary_max,
  } = req.body;

  try {
    const job = new Job({
      title,
      job_description,
      job_qualification,
      job_type,
      job_tenure,
      job_status,
      company_name,
      company_image_url,
      company_city,
      salary_min,
      salary_max,
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Update Job
exports.updateJob = async (req, res) => {
  const {
    title,
    job_description,
    job_qualification,
    job_type,
    job_tenure,
    job_status,
    company_name,
    company_image_url,
    company_city,
    salary_min,
    salary_max,
  } = req.body;

  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title,
        job_description,
        job_qualification,
        job_type,
        job_tenure,
        job_status,
        company_name,
        company_image_url,
        company_city,
        salary_min,
        salary_max,
      },
      { new: true }
    );

    res.json(job);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete Job
exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ msg: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
