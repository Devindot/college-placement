const express = require("express")
const User = require("../models/user")
const Company = require("../models/company")
const Application = require("../models/application")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all students
router.get("/students", adminAuth, async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password")
    res.status(200).json({ students })
  } catch (error) {
    res.status(500).json({ message: "Failed to get students", error: error.message })
  }
})

// Get student by ID
router.get("/student/:id", adminAuth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password")

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    res.status(200).json({ student })
  } catch (error) {
    res.status(500).json({ message: "Failed to get student", error: error.message })
  }
})

// Update student
router.put("/student/:id", adminAuth, async (req, res) => {
  try {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["firstName", "lastName", "phone", "course", "branch", "year", "cgpa", "address"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" })
    }

    const student = await User.findById(req.params.id)

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    updates.forEach((update) => (student[update] = req.body[update]))
    await student.save()

    res.status(200).json({
      message: "Student updated successfully",
      student,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to update student", error: error.message })
  }
})

// Get all companies
router.get("/companies", adminAuth, async (req, res) => {
  try {
    const companies = await Company.find()
    res.status(200).json({ companies })
  } catch (error) {
    res.status(500).json({ message: "Failed to get companies", error: error.message })
  }
})

// Add a new company
router.post("/company", adminAuth, async (req, res) => {
  try {
    const company = new Company(req.body)
    await company.save()

    res.status(201).json({
      message: "Company added successfully",
      company,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to add company", error: error.message })
  }
})

// Update company
router.put("/company/:id", adminAuth, async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!company) {
      return res.status(404).json({ message: "Company not found" })
    }

    res.status(200).json({
      message: "Company updated successfully",
      company,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to update company", error: error.message })
  }
})

// Delete company
router.delete("/company/:id", adminAuth, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id)

    if (!company) {
      return res.status(404).json({ message: "Company not found" })
    }

    // Delete all applications for this company
    await Application.deleteMany({ company: req.params.id })

    res.status(200).json({ message: "Company deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete company", error: error.message })
  }
})

// Get all applications
router.get("/applications", adminAuth, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("user", "-password")
      .populate("company")
      .sort({ appliedDate: -1 })

    res.status(200).json({ applications })
  } catch (error) {
    res.status(500).json({ message: "Failed to get applications", error: error.message })
  }
})

// Update application status
router.put("/application/:id", adminAuth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)

    if (!application) {
      return res.status(404).json({ message: "Application not found" })
    }

    // Update status
    application.status = req.body.status

    if (req.body.interviewDate) {
      application.interviewDate = new Date(req.body.interviewDate)
    }

    if (req.body.interviewLocation) {
      application.interviewLocation = req.body.interviewLocation
    }

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

// Get placement statistics
router.get("/statistics", adminAuth, async (req, res) => {
  try {
    // Total students
    const totalStudents = await User.countDocuments({ role: "student" })

    // Total companies
    const totalCompanies = await Company.countDocuments()

    // Total applications
    const totalApplications = await Application.countDocuments()

    // Placed students
    const placedStudents = await Application.countDocuments({ status: "accepted" })

    // Applications by status
    const pending = await Application.countDocuments({ status: "pending" })
    const interview = await Application.countDocuments({ status: "interview" })
    const accepted = await Application.countDocuments({ status: "accepted" })
    const rejected = await Application.countDocuments({ status: "rejected" })

    // Applications by course
    const applications = await Application.find().populate("user", "course")

    const courseStats = {}
    applications.forEach((app) => {
      if (app.user && app.user.course) {
        if (!courseStats[app.user.course]) {
          courseStats[app.user.course] = {
            total: 0,
            accepted: 0,
          }
        }

        courseStats[app.user.course].total++

        if (app.status === "accepted") {
          courseStats[app.user.course].accepted++
        }
      }
    })

    res.status(200).json({
      totalStudents,
      totalCompanies,
      totalApplications,
      placedStudents,
      statusStats: {
        pending,
        interview,
        accepted,
        rejected,
      },
      courseStats,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to get statistics", error: error.message })
  }
})

module.exports = router

