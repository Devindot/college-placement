const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const path = require("path")
const authRoutes = require("./routes/auth")
const studentRoutes = require("./routes/student")
const adminRoutes = require("./routes/admin")
const companyRoutes = require("./routes/company")
const { connectDB } = require("./config/db")

// Initialize express app
const app = express()
const PORT = process.env.PORT || 3000

// Connect to MongoDB
connectDB()

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from your frontend
    credentials: true, // Allow cookies to be sent
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Session configuration
app.use(
  session({
    secret: "college-placement-system-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Serve static files
app.use(express.static(path.join(__dirname, "../public")))

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/student", studentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/company", companyRoutes)

// Sample API endpoint for latest opportunities
app.get("/api/opportunities/latest", async (req, res) => {
  try {
    const opportunities = await mongoose
      .model("Company")
      .find()
      .select({ name: 1, positions: 1, createdAt: 1 })
      .limit(10)
      .exec()

    const latestOpportunities = opportunities.flatMap((company) => {
      return company.positions.map((position) => ({
        _id: company._id,
        company: company.name,
        position: position.title,
        eligibility: position.eligibility,
        postedDate: company.createdAt,
      }))
    })

    res.json(latestOpportunities)
  } catch (error) {
    console.error("Failed to fetch latest opportunities:", error)
    res.status(500).json({ message: "Failed to fetch latest opportunities", error: error.message })
  }
})

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"))
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app