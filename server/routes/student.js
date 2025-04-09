const express = require("express")
const User = require("../models/user")
const Application = require("../models/application")
const Company = require("../models/company")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get student profile
router.get("/profile", auth, async (req, res) => {
  try {
    res.status(200).json({
      user: req.user.getPublicProfile(),
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to get profile", error: error.message })
  }
})

// Update student profile
router.put("/profile", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["firstName", "lastName", "phone", "address", "cgpa"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" })
    }

    updates.forEach((update) => (req.user[update] = req.body[update]))
    await req.user.save()

    res.status(200).json({
      message: "Profile updated successfully",
      user: req.user.getPublicProfile(),
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message })
  }
})

// Get all applications for a student
router.get("/applications", auth, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id }).populate("company").sort({ appliedDate: -1 })

    res.status(200).json({ applications })
  } catch (error) {
    res.status(500).json({ message: "Failed to get applications", error: error.message })
  }
})

// Apply for a job
router.post("/apply/:companyId", auth, async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId)

    if (!company) {
      return res.status(404).json({ message: "Company not found" })
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      user: req.user._id,
      company: company._id,
      position: req.body.position,
    })

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this position" })
    }

    // Create new application
    const application = new Application({
      user: req.user._id,
      company: company._id,
      position: req.body.position,
      notes: req.body.notes,
    })

    await application.save()

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to apply", error: error.message })
  }
})

// Add off-campus application
router.post("/off-campus", auth, async (req, res) => {
  try {
    const { companyName, position, appliedDate, status, notes } = req.body

    // Create a temporary company for off-campus application
    let company = await Company.findOne({ name: companyName })

    if (!company) {
      company = new Company({
        name: companyName,
        description: "Off-campus application",
        location: "N/A",
        industry: "N/A",
        positions: [
          {
            title: position,
            description: "Off-campus application",
            jobType: "Full Time",
            ctc: 0,
            eligibility: "N/A",
            lastDate: new Date(),
          },
        ],
      })

      await company.save()
    }

    // Create application
    const application = new Application({
      user: req.user._id,
      company: company._id,
      position,
      status,
      appliedDate: new Date(appliedDate),
      notes,
      isOffCampus: true,
    })

    await application.save()

    res.status(201).json({
      message: "Off-campus application added successfully",
      application,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to add off-campus application", error: error.message })
  }
})

// Update application status (for off-campus applications)
router.put("/application/:id", auth, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
      isOffCampus: true,
    })

    if (!application) {
      return res.status(404).json({ message: "Application not found" })
    }

    // Update status
    application.status = req.body.status

    if (req.body.notes) {
      application.notes = req.body.notes
    }

    await application.save()

    res.status(200).json({
      message: "Application updated successfully",
      application,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to update application", error: error.message })
  }
})

module.exports = router

