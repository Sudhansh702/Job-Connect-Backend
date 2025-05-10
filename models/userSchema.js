const mongoose = require("mongoose");
const validator = require( "validator");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: [true, "Please enter your Name!"],
    minLength: [3, "Name must contain at least 3 Characters!"],
    maxLength: [30, "Name cannot exceed 30 Characters!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your Email!"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid Email!"],
  },
  password: {
    type: String,
    required: [true, "Please provide a Password!"],
    minLength: [8, "Password must contain at least 8 characters!"],
    maxLength: [32, "Password cannot exceed 32 characters!"],
    select: false,
  },
  fullName: { 
    type: String, required: true 
  },
  appliedJobs: [{
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Jobs",
  }],
  professionalTitle: { 
    type: String, required: true 
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);