const mongoose = require("mongoose")

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "interview", "accepted", "rejected"],
    default: "pending",
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  interviewDate: {
    type: Date,
  },
  interviewLocation: {
    type: String,
  },
  notes: {
    type: String,
  },
  isOffCampus: {
    type: Boolean,
    default: false,
  },
})

const Application = mongoose.model("Application", applicationSchema)

module.exports = Application

