const express = require('express')
const jwt = require('jsonwebtoken');
const router = express.Router();
const Applications = require('../models/appllicationSchema')
const Jobs = require('../models/jobsSchema')

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};
// delete application
router.delete('/deleteapplication/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const application = await Applications.findOneAndDelete({ jobId, applicantID: req.user.id });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
);

// approve application
router.post('/applicants/:applicationId/approve', authMiddleware, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await Applications.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    application.approved = true;
    await application.save();
    res.status(200).json({ message: 'Application approved successfully' });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
);
 
router.get('/applicants', authMiddleware, async (req, res) => {
  try {
    const jobId = req.query.jobId;
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }
    const job = await Jobs.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const applications = await Applications.find({ jobId }).populate('applicantID', 'name');
    const applicationsWithResume = applications.map(application => {
      if (application.resume && application.resume.data) {
        const base64Resume = application.resume.data.toString('base64');
        return {
          ...application.toObject(),
          resume: `data:${application.resume.contentType};base64,${base64Resume}`
        };
      }
      return application;
    });
    console.log('Applications:', applicationsWithResume);
    res.json(applicationsWithResume);

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ error: 'An error occurred while fetching applicants' });
  }
});

router.get('/appliedjobs', async (req, res) => {
  try {
    const userId = req.query.ID;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const userApplications = await Applications.find({ applicantID: userId }).sort({ appliedOn: -1 });
    // find every job application.jobId
    const jobIds = userApplications.map(application => application.jobId);
    const jobs = await Jobs.find({ _id: { $in: jobIds } }).populate('postedBy', 'username');
    const jobsWithApprovalStatus = jobs.map(job => {
      const application = userApplications.find(app => app.jobId.toString() === job._id.toString());
      return {
      ...job.toObject(),
      approved: application ? application.approved : false
      };
    });
    res.json(jobsWithApprovalStatus);

    // res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching jobs' });
  }
})
router.post('/applyjob', authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    const { name, email, cover, jobId, employerID } = req.body;
    const applicantID = req.user.id;
    const resumeFile = req.file;

    const alreadyApplied = await Applications.findOne({ jobId, applicantID });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }
    // console.log("Incoming data:", { name, email, cover, jobId, employerID, resumeFile, applicantID });

    if (!jobId || !name || !email || !cover || !resumeFile) {
      return res.status(400).json({ message: 'All fields are required, including a resume.' });
    }

    if (!['image/png'].includes(resumeFile.mimetype)) {
      return res.status(400).json({ message: 'Invalid resume format. Only PNG images are allowed.' });
    }
    // console.log('creating new')
    const newApplication = new Applications({
      name,
      email,
      coverLetter: cover,
      jobId,
      applicantID,
      employerID,
      resume: {
        data: resumeFile.buffer,
        contentType: resumeFile.mimetype,
      },
    });

    await newApplication.save();

    // console.log('Application saved:', newApplication);

    res.status(201).json({ message: 'Application submitted successfully', newApplication });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;





