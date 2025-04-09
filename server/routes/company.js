const express = require("express")
const Company = require("../models/company")
const Application = require("../models/application")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get all companies
router.get("/", async (req, res) => {
  try {
    const companies = await Company.find()
    res.status(200).json({ companies })
  } catch (error) {
    res.status(500).json({ message: "Failed to get companies", error: error.message })
  }
})

// Get company by ID
router.get("/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)

    if (!company) {
      return res.status(404).json({ message: "Company not found" })
    }

    res.status(200).json({ company })
  } catch (error) {
    res.status(500).json({ message: "Failed to get company", error: error.message })
  }
})

// Get all positions for a company
router.get("/:id/positions", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)

    if (!company) {
      return res.status(404).json({ message: "Company not found" })
    }

    res.status(200).json({ positions: company.positions })
  } catch (error) {
    res.status(500).json({ message: "Failed to get positions", error: error.message })
  }
})

// Check if user has applied for a position
router.get("/:id/check-application", auth, async (req, res) => {
  try {
    const application = await Application.findOne({
      user: req.user._id,
      company: req.params.id,
      position: req.query.position,
    })

    res.status(200).json({
      hasApplied: !!application,
      application,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to check application", error: error.message })
  }
})

module.exports = router

