const mongoose = require("mongoose")

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  positions: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      jobType: {
        type: String,
        enum: ["Full Time", "Internship"],
        required: true,
      },
      ctc: {
        type: Number,
        required: true,
      },
      eligibility: {
        type: String,
        required: true,
      },
      skills: [
        {
          type: String,
        },
      ],
      lastDate: {
        type: Date,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Company = mongoose.model("Company", companySchema)

module.exports = Company

