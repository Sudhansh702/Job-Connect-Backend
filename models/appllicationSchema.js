const mongoose = require("mongoose");


const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your Name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your Email!"],
  },
  coverLetter: {
    type: String, 
    required: [true, "Please provide a cover letter!"],
  },
  resume: {
    type :String,
    required : true,
  },
  jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jobs",
      required: true,
  },
  applicantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
  },
  appliedOn: {
    type: Date,
    default: Date.now,
  },
  employerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("Application", applicationSchema);
