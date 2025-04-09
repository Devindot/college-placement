const jwt = require("jsonwebtoken")
const User = require("../models/user")

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET

// Middleware to authenticate user
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Authentication required" })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Find user by id
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    // Add user to request object
    req.user = user
    req.token = token

    next()
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" })
  }
}

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    // First authenticate user
    await auth(req, res, () => {
      // Check if user is admin
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required" })
      }

      next()
    })
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" })
  }
}

module.exports = { auth, adminAuth }

