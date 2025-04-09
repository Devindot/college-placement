const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const { auth } = require("../middleware/auth")

const router = express.Router()

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "college-placement-system-secret-key"

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, rollNumber, course, branch, year, cgpa, address } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Check if roll number already exists
    const existingRoll = await User.findOne({ rollNumber })

    if (existingRoll) {
      return res.status(400).json({ message: "User already exists with this roll number" })
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      rollNumber,
      course,
      branch,
      year,
      cgpa,
      address,
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: user.getPublicProfile(),
    })
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message })
  }
})

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    // Set cookie if remember me is checked
    if (req.body.rememberMe) {
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: process.env.NODE_ENV === "production",
      })
    }

    res.status(200).json({
      message: "Login successful",
      token,
      user: user.getPublicProfile(),
    })
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message })
  }
})

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    res.status(200).json({
      user: req.user.getPublicProfile(),
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to get user", error: error.message })
  }
})

// Change password
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Check current password
    const isMatch = await req.user.comparePassword(currentPassword)

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    // Update password
    req.user.password = newPassword
    await req.user.save()

    res.status(200).json({ message: "Password changed successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to change password", error: error.message })
  }
})

// Logout user
router.post("/logout", auth, async (req, res) => {
  try {
    res.clearCookie("token")
    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message })
  }
})

module.exports = router

