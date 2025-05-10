const jwt = require('jsonwebtoken');
const express = require('express')
const router = express.Router();
const Jobs = require("../../models/jobsSchema");
const User = require("../../models/userSchema");
const Applications = require('../../models/appllicationSchema')

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
router.get('/job',async(req,res)=>{
    try {
        const {jobId} = req.query;
        if(!jobId)return res.status(401).json({message:'Job Id is missing   '})
        const job = await Jobs.findOne({_id :jobId})
        res.json(job)
    } catch (error) {        
        res.status(500).json({ error: 'An error occurred while fetching jobs' });
    }
})
// search route
router.get('/jobs', async (req, res) => {
    try {
        const { keywords, location , userId} = req.query;
        let query = {};

        if (keywords) {
            query.$or = [
                { title: { $regex: keywords, $options: 'i' } }, 
                { type: { $regex: keywords, $options: 'i' } }
            ];
        }
        if (location) {
            query.$or = [
                ...(query.$or || []),
                { location: { $regex: location, $options: 'i' } }, 
                { country: { $regex: location, $options: 'i' } },
                { city: { $regex: location, $options: 'i' } }
            ];
        }

        const jobs = await Jobs.find({ 
            ...query, 
            postedBy: { $ne: userId } 
        }).sort({ jobPostedOn: -1 }).limit(20);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching jobs' });
    }
});
router.get('/myjobs', async (req, res) => {
    try {
        const userId = req.query.ID;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const jobs = await Jobs.find({ postedBy: userId }).sort({ jobPostedOn: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching jobs' });
    }
});
// edit the job
router.put('/editjob/:jobId', authMiddleware, async (req, res) => {
    try {
        const { jobId } = req.params;
        const updatedJob = req.body;

        if (!updatedJob) {
            return res.status(400).json({ error: 'Job details are required' });
        }

        const job = await Jobs.findByIdAndUpdate(jobId, updatedJob, { new: true });
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({ message: 'Job updated successfully', job });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'An error occurred while updating the job' });
    }
});
// create new job
router.post('/postjob', authMiddleware, async (req, res) => {
    try {
        // console.log(req.body)
        const newJob  = req.body;
 
        if (!newJob) {
            return res.status(400).json({ error: 'Job details are required' });
        }

        const jobData = {
            ...newJob,
            postedBy: req.user.id,
            postedByName: req.user.username,
            salary: Number(newJob.salary) 
        };

        const newJobEntry = await Jobs.create(jobData);
        res.status(201).json({ message: 'Job posted successfully', job: newJobEntry });
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ error: 'An error occurred while posting the job' });
    }
});
// delete job
router.delete('/deletejob/:jobId', authMiddleware, async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required' });
        }

        const deletedJob = await Jobs.findByIdAndDelete(jobId);
        if (!deletedJob) {
            return res.status(404).json({ error: 'Job not found' });
        }
        const deletedApplications = await Applications.deleteMany({ jobId });
        if (deletedApplications.deletedCount > 0) {
            console.log(`Deleted ${deletedApplications.deletedCount} applications for job ID: ${jobId}`);
        } else {
            console.log(`No applications found for job ID: ${jobId}`);
        }

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'An error occurred while deleting the job' });
    }
});


module.exports = router;