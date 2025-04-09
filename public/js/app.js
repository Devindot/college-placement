import { Chart } from "@/components/ui/chart"
// Initialize Angular App
var app = angular.module("placementApp", [])

// Custom directive for password matching
app.directive("compareTo", () => ({
  require: "ngModel",
  scope: {
    otherModelValue: "=compareTo",
  },
  link: (scope, element, attributes, ngModel) => {
    ngModel.$validators.compareTo = (modelValue) => modelValue === scope.otherModelValue

    scope.$watch("otherModelValue", () => {
      ngModel.$validate()
    })
  },
}))

// Filter to capitalize first letter
app.filter("capitalize", () => (input) => {
  if (!input) return ""
  return input.charAt(0).toUpperCase() + input.slice(1)
})

// Login Controller
app.controller("LoginController", ($scope) => {
  $scope.user = {
    email: "",
    password: "",
    rememberMe: false,
  }

  $scope.errorMessage = ""
  $scope.isSubmitting = false

  $scope.login = () => {
    $scope.isSubmitting = true
    $scope.errorMessage = ""

    // AJAX request to login
    $.ajax({
      url: "/api/auth/login",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify($scope.user),
      success: (response) => {
        // Store token and user info
        localStorage.setItem("token", response.token)
        localStorage.setItem("name", response.user.firstName + " " + response.user.lastName)
        localStorage.setItem("userId", response.user._id)
        localStorage.setItem("role", response.user.role)

        // Redirect based on user role
        if (response.user.role === "admin") {
          window.location.href = "admin-dashboard.html"
        } else {
          window.location.href = "student-dashboard.html"
        }
      },
      error: (xhr) => {
        $scope.$apply(() => {
          $scope.isSubmitting = false
          $scope.errorMessage = xhr.responseJSON ? xhr.responseJSON.message : "Login failed. Please try again."
        })
      },
    })
  }
})

// Register Controller
app.controller("RegisterController", ($scope) => {
  $scope.user = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    rollNumber: "",
    course: "",
    branch: "",
    year: "",
    cgpa: "",
    address: "",
    termsAgree: false,
  }

  $scope.errorMessage = ""
  $scope.successMessage = ""
  $scope.isSubmitting = false

  $scope.register = () => {
    $scope.isSubmitting = true
    $scope.errorMessage = ""
    $scope.successMessage = ""

    // AJAX request to register
    $.ajax({
      url: "/api/auth/register",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify($scope.user),
      success: (response) => {
        $scope.$apply(() => {
          $scope.isSubmitting = false
          $scope.successMessage = "Registration successful! Redirecting to login..."

          // Clear form
          $scope.user = {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            rollNumber: "",
            course: "",
            branch: "",
            year: "",
            cgpa: "",
            address: "",
            termsAgree: false,
          }

          // Redirect to login after 2 seconds
          setTimeout(() => {
            window.location.href = "login.html"
          }, 2000)
        })
      },
      error: (xhr) => {
        $scope.$apply(() => {
          $scope.isSubmitting = false
          $scope.errorMessage = xhr.responseJSON ? xhr.responseJSON.message : "Registration failed. Please try again."
        })
      },
    })
  }
})

// Student Dashboard Controller
app.controller("StudentDashboardController", ($scope) => {
  // Load student profile
  $scope.loadStudentProfile = () => {
    $.ajax({
      url: "/api/student/profile",
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: (response) => {
        $scope.$apply(() => {
          $scope.student = response.user
        })
      },
      error: (xhr) => {
        console.error("Failed to load profile:", xhr.responseJSON)
      },
    })
  }

  // Load applications
  $scope.loadApplications = () => {
    $.ajax({
      url: "/api/student/applications",
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: (response) => {
        $scope.$apply(() => {
          $scope.applications = response.applications
          $scope.filterApplications()
        })
      },
      error: (xhr) => {
        console.error("Failed to load applications:", xhr.responseJSON)
      },
    })
  }

  // Initialize data
  $scope.student = {}
  $scope.applications = []
  $scope.interviews = []
  $scope.offCampusApplications = []

  // Load data on controller initialization
  $scope.loadStudentProfile()
  $scope.loadApplications()

  // Mock data for interviews
  $scope.interviews = [
    {
      _id: "1",
      company: "Global Systems",
      position: "Frontend Developer",
      date: new Date("2025-04-15"),
      time: "10:00 AM",
      location: "Online (Zoom)",
    },
    {
      _id: "2",
      company: "Cloud Services Co.",
      position: "DevOps Engineer",
      date: new Date("2025-04-20"),
      time: "2:30 PM",
      location: "Main Campus, Room 302",
    },
  ]

  // Mock data for off-campus applications
  $scope.offCampusApplications = [
    {
      _id: "1",
      company: "Startup Innovations",
      position: "Full Stack Developer",
      appliedDate: new Date("2025-03-20"),
      status: "pending",
    },
    {
      _id: "2",
      company: "Tech Giants",
      position: "Software Engineer",
      appliedDate: new Date("2025-03-18"),
      status: "interview",
    },
  ]

  // Filter for applications
  $scope.filter = "all"
  $scope.setFilter = (filterType) => {
    $scope.filter = filterType
    $scope.filterApplications()
  }

  $scope.filterApplications = () => {
    if ($scope.filter === "all") {
      $scope.filteredApplications = $scope.applications
    } else {
      $scope.filteredApplications = $scope.applications.filter((app) => app.status === $scope.filter)
    }
  }

  // Initialize filtered applications
  $scope.filteredApplications = $scope.applications

  // Format date function
  $scope.formatDate = (date) => new Date(date).toLocaleDateString()

  // View application details
  $scope.viewApplication = (application) => {
    // In a real app, this would open a modal or navigate to a details page
    alert("Viewing application for " + application.position + " at " + application.company)
  }

  // Add off-campus application
  $scope.offCampus = {
    company: "",
    position: "",
    appliedDate: new Date(),
    status: "pending",
    notes: "",
  }

  $scope.addOffCampusApplication = () => {
    $.ajax({
      url: "/api/student/off-campus",
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      contentType: "application/json",
      data: JSON.stringify({
        companyName: $scope.offCampus.company,
        position: $scope.offCampus.position,
        appliedDate: $scope.offCampus.appliedDate,
        status: $scope.offCampus.status,
        notes: $scope.offCampus.notes,
      }),
      success: (response) => {
        $scope.$apply(() => {
          $scope.offCampusApplications.unshift({
            _id: response.application._id,
            company: $scope.offCampus.company,
            position: $scope.offCampus.position,
            appliedDate: $scope.offCampus.appliedDate,
            status: $scope.offCampus.status,
            notes: $scope.offCampus.notes,
          })

          // Reset form
          $scope.offCampus = {
            company: "",
            position: "",
            appliedDate: new Date(),
            status: "pending",
            notes: "",
          }
        })

        // Close modal
        $("#offCampusModal").modal("hide")
      },
      error: (xhr) => {
        console.error("Failed to add off-campus application:", xhr.responseJSON)
        alert("Failed to add application. Please try again.")
      },
    })
  }

  // Change password
  $scope.passwordData = {
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  }

  $scope.changePassword = () => {
    $.ajax({
      url: "/api/auth/change-password",
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      contentType: "application/json",
      data: JSON.stringify({
        currentPassword: $scope.passwordData.currentPassword,
        newPassword: $scope.passwordData.newPassword,
      }),
      success: () => {
        alert("Password changed successfully!")

        // Reset form and close modal
        $scope.$apply(() => {
          $scope.passwordData = {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          }
        })

        $("#changePasswordModal").modal("hide")
      },
      error: (xhr) => {
        alert(xhr.responseJSON ? xhr.responseJSON.message : "Failed to change password. Please try again.")
      },
    })
  }
})

// Company Listings Controller
app.controller("CompanyListingsController", ($scope) => {
  $scope.isLoading = true
  $scope.isLoggedIn = localStorage.getItem("token") !== null

  // Filters
  $scope.search = ""
  $scope.filters = {
    fullTime: false,
    internship: false,
    minCTC: 0,
    btech: false,
    mtech: false,
    mba: false,
  }

  // Load companies
  $scope.loadCompanies = () => {
    $.ajax({
      url: "/api/company",
      method: "GET",
      success: (response) => {
        $scope.$apply(() => {
          $scope.isLoading = false

          // Transform company data to match the expected format
          $scope.companies = response.companies.flatMap((company) => {
            // For each company, create entries for each position
            return company.positions.map((position) => ({
              _id: company._id,
              company: company.name,
              position: position.title,
              description: position.description,
              jobType: position.jobType,
              ctc: position.ctc,
              location: company.location,
              postedDate: new Date(company.createdAt),
              lastDate: new Date(position.lastDate),
              eligibility: position.eligibility,
              skills: position.skills || [],
              hasApplied: false, // Will be updated later
            }))
          }) // Flatten the array of arrays

          $scope.filteredCompanies = $scope.companies

          // If user is logged in, check which positions they've applied to
          if ($scope.isLoggedIn) {
            $scope.checkApplications()
          }
        })
      },
      error: () => {
        $scope.$apply(() => {
          $scope.isLoading = false
          $scope.companies = []
          $scope.filteredCompanies = []
        })
      },
    })
  }

  // Check which positions the user has applied to
  $scope.checkApplications = () => {
    if (!$scope.isLoggedIn) return

    $.ajax({
      url: "/api/student/applications",
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: (response) => {
        const applications = response.applications

        // Mark companies that user has applied to
        $scope.$apply(() => {
          $scope.companies.forEach((company) => {
            const applied = applications.some(
              (app) => app.company._id === company._id && app.position === company.position,
            )
            company.hasApplied = applied
          })

          // Update filtered companies
          $scope.filterCompanies()
        })
      },
      error: (xhr) => {
        console.error("Failed to load applications:", xhr.responseJSON)
      },
    })
  }

  // Load companies on controller initialization
  $scope.loadCompanies()

  // Filter companies
  $scope.filterCompanies = () => {
    $scope.filteredCompanies = $scope.companies.filter((company) => {
      // Search filter
      if (
        $scope.search &&
        !company.company.toLowerCase().includes($scope.search.toLowerCase()) &&
        !company.position.toLowerCase().includes($scope.search.toLowerCase())
      ) {
        return false
      }

      // Job type filter
      if (
        ($scope.filters.fullTime && company.jobType !== "Full Time") ||
        ($scope.filters.internship && company.jobType !== "Internship")
      ) {
        if ($scope.filters.fullTime || $scope.filters.internship) {
          return false
        }
      }

      // CTC filter
      if (company.ctc < $scope.filters.minCTC) {
        return false
      }

      // Eligibility filter
      if (
        ($scope.filters.btech && !company.eligibility.includes("B.Tech")) ||
        ($scope.filters.mtech && !company.eligibility.includes("M.Tech")) ||
        ($scope.filters.mba && !company.eligibility.includes("MBA"))
      ) {
        if ($scope.filters.btech || $scope.filters.mtech || $scope.filters.mba) {
          return false
        }
      }

      return true
    })
  }

  // Watch for filter changes
  $scope.$watch("search", $scope.filterCompanies)
  $scope.$watch("filters", $scope.filterCompanies, true)

  // Reset filters
  $scope.resetFilters = () => {
    $scope.search = ""
    $scope.filters = {
      fullTime: false,
      internship: false,
      minCTC: 0,
      btech: false,
      mtech: false,
      mba: false,
    }
  }

  // Sort companies
  $scope.sortBy = (field) => {
    $scope.filteredCompanies.sort((a, b) => {
      if (field === "postedDate") {
        return new Date(b.postedDate) - new Date(a.postedDate)
      } else if (field === "ctc") {
        return b.ctc - a.ctc
      } else if (field === "company") {
        return a.company.localeCompare(b.company)
      }
    })
  }

  // Format date
  $scope.formatDate = (date) => new Date(date).toLocaleDateString()

  // Apply for job
  $scope.applyForJob = (company) => {
    if (!$scope.isLoggedIn) {
      $("#loginRequiredModal").modal("show")
      return
    }

    $.ajax({
      url: `/api/student/apply/${company._id}`,
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      contentType: "application/json",
      data: JSON.stringify({
        position: company.position,
        notes: "Applied through company listings",
      }),
      success: () => {
        alert("Applied successfully for " + company.position + " at " + company.company)
        company.hasApplied = true
        $scope.$apply()
      },
      error: (xhr) => {
        alert(xhr.responseJSON ? xhr.responseJSON.message : "Failed to apply. Please try again.")
      },
    })
  }
})

// Profile Controller
app.controller("ProfileController", ($scope) => {
  // Load student profile
  $scope.loadStudentProfile = () => {
    $.ajax({
      url: "/api/student/profile",
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: (response) => {
        $scope.$apply(() => {
          $scope.student = response.user

          // Initialize edit data
          $scope.editData = {
            firstName: $scope.student.firstName,
            lastName: $scope.student.lastName,
            phone: $scope.student.phone,
            cgpa: $scope.student.cgpa,
            address: $scope.student.address,
          }
        })
      },
      error: (xhr) => {
        console.error("Failed to load profile:", xhr.responseJSON)
      },
    })
  }

  // Initialize data
  $scope.student = {}
  $scope.editData = {}
  $scope.newSkill = ""
  $scope.newEducation = {
    degree: "",
    institution: "",
    year: "",
    percentage: "",
  }
  $scope.newProject = {
    title: "",
    description: "",
    year: "",
    technologies: "",
  }
  $scope.passwordData = {
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  }

  // Load profile on controller initialization
  $scope.loadStudentProfile()

  // Format date function
  $scope.formatDate = (date) => new Date(date).toLocaleDateString()

  // Update profile
  $scope.updateProfile = () => {
    $.ajax({
      url: "/api/student/profile",
      method: "PUT",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      contentType: "application/json",
      data: JSON.stringify($scope.editData),
      success: (response) => {
        alert("Profile updated successfully!")
        $scope.$apply(() => {
          $scope.student = response.user
        })
        $("#editProfileModal").modal("hide")
      },
      error: (xhr) => {
        alert(xhr.responseJSON ? xhr.responseJSON.message : "Failed to update profile. Please try again.")
      },
    })
  }

  // Add skill
  $scope.addSkill = () => {
    if (!$scope.student.skills) {
      $scope.student.skills = []
    }

    $scope.student.skills.push($scope.newSkill)
    $scope.newSkill = ""
    $("#addSkillModal").modal("hide")

    // In a real app, this would make an AJAX call to save the skills
  }

  // Add education
  $scope.addEducation = () => {
    if (!$scope.student.education) {
      $scope.student.education = []
    }

    $scope.student.education.push($scope.newEducation)
    $scope.newEducation = {
      degree: "",
      institution: "",
      year: "",
      percentage: "",
    }
    $("#addEducationModal").modal("hide")

    // In a real app, this would make an AJAX call to save the education
  }

  // Add project
  $scope.addProject = () => {
    if (!$scope.student.projects) {
      $scope.student.projects = []
    }

    $scope.student.projects.push($scope.newProject)
    $scope.newProject = {
      title: "",
      description: "",
      year: "",
      technologies: "",
    }
    $("#addProjectModal").modal("hide")

    // In a real app, this would make an AJAX call to save the projects
  }

  // Upload resume
  $scope.uploadResume = () => {
    // In a real app, this would make an AJAX call to upload the resume
    $scope.student.resume = {
      filename: "resume.pdf",
      uploadDate: new Date(),
    }
    $("#uploadResumeModal").modal("hide")
  }

  // Upload photo
  $scope.uploadPhoto = () => {
    // In a real app, this would make an AJAX call to upload the photo
    $("#uploadPhotoModal").modal("hide")
  }

  // Change password
  $scope.changePassword = () => {
    $.ajax({
      url: "/api/auth/change-password",
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      contentType: "application/json",
      data: JSON.stringify({
        currentPassword: $scope.passwordData.currentPassword,
        newPassword: $scope.passwordData.newPassword,
      }),
      success: () => {
        alert("Password changed successfully!")
        $scope.$apply(() => {
          $scope.passwordData = {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          }
        })
        $("#changePasswordModal").modal("hide")
      },
      error: (xhr) => {
        alert(xhr.responseJSON ? xhr.responseJSON.message : "Failed to change password. Please try again.")
      },
    })
  }
})

// Admin Dashboard Controller
app.controller("AdminDashboardController", ($scope) => {
  // Initialize data
  $scope.stats = {
    totalStudents: 0,
    placedStudents: 0,
    totalCompanies: 0,
    totalApplications: 0,
  }
  $scope.students = []
  $scope.companies = []
  $scope.applications = []
  $scope.recentApplications = []
  $scope.courseSummary = []
  $scope.totalSummary = {
    totalStudents: 0,
    placedStudents: 0,
    placementPercentage: 0,
    highestCTC: 0,
    averageCTC: 0,
  }

  // Load statistics
  $scope.loadStatistics = () => {
    $.ajax({
      url: "/api/admin/statistics",
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: (response) => {
        $scope.$apply(() => {
          $scope.stats = response

          // Update charts
          updateCharts(response)
        })
      },
      error: (xhr) => {
        console.error("Failed to load statistics:", xhr.responseJSON)
      },
    })
  }

  // Load students
  $scope.loadStudents = () => {
    $.ajax({
      url: "/api/admin/students",
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: (response) => {
        $scope.$apply(() => {
          $scope.students = response.students
        })
      },
      error: (xhr) => {
        console.error("Failed to load students:", xhr.responseJSON)
      },
    })
  }

  // Load companies
  $scope.loadCompanies = () => {
    $.ajax({
      url: "/api/admin/companies",
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: (response) => {
        $scope.$apply(() => {
          $scope.companies = response.companies
        })
      },
      error: (xhr) => {
        console.error("Failed to load companies:", xhr.responseJSON)
      },
    })
  }

  // Load applications
  $scope.loadApplications = () => {
    $.ajax({
      url: "/api/admin/applications",
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: (response) => {
        $scope.$apply(() => {
          $scope.applications = response.applications

          // Format applications for display
          $scope.applications.forEach((app) => {
            app.studentName = app.user.firstName + " " + app.user.lastName
            app.company = app.company.name
          })

          // Get recent applications
          $scope.recentApplications = $scope.applications.slice(0, 5)
        })
      },
      error: (xhr) => {
        console.error("Failed to load applications:", xhr.responseJSON)
      },
    })
  }

  // Load all data on controller initialization
  $scope.loadStatistics()
  $scope.loadStudents()
  $scope.loadCompanies()
  $scope.loadApplications()

  // Format date function
  $scope.formatDate = (date) => new Date(date).toLocaleDateString()

  // View student
  $scope.viewStudent = (student) => {
    // In a real app, this would open a modal or navigate to a details page
    alert("Viewing student: " + student.firstName + " " + student.lastName)
  }

  // Edit student
  $scope.editStudent = (student) => {
    // In a real app, this would open a modal for editing
    alert("Editing student: " + student.firstName + " " + student.lastName)
  }

  // Add company
  $scope.companyData = {
    name: "",
    industry: "",
    location: "",
    website: "",
    description: "",
    positions: [],
  }

  $scope.addCompany = () => {
    // Reset form
    $scope.companyData = {
      name: "",
      industry: "",
      location: "",
      website: "",
      description: "",
      positions: [],
    }

    // Open modal
    $("#companyModal").modal("show")
  }

  // Add position to company
  $scope.addPosition = () => {
    $scope.companyData.positions.push({
      title: "",
      jobType: "Full Time",
      ctc: 0,
      lastDate: "",
      description: "",
      eligibility: "",
      skillsInput: "",
    })
  }

  // Remove position from company
  $scope.removePosition = (index) => {
    $scope.companyData.positions.splice(index, 1)
  }

  // Save company
  $scope.saveCompany = () => {
    // Process skills input
    $scope.companyData.positions.forEach((position) => {
      if (position.skillsInput) {
        position.skills = position.skillsInput.split(",").map((skill) => skill.trim())
        delete position.skillsInput
      }
    })

    $.ajax({
      url: "/api/admin/company",
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      contentType: "application/json",
      data: JSON.stringify($scope.companyData),
      success: (response) => {
        alert("Company added successfully!")
        $scope.loadCompanies()
        $("#companyModal").modal("hide")
      },
      error: (xhr) => {
        alert(xhr.responseJSON ? xhr.responseJSON.message : "Failed to add company. Please try again.")
      },
    })
  }

  // View company
  $scope.viewCompany = (company) => {
    // In a real app, this would open a modal or navigate to a details page
    alert("Viewing company: " + company.name)
  }

  // Edit company
  $scope.editCompany = (company) => {
    // In a real app, this would populate the form and open the modal
    alert("Editing company: " + company.name)
  }

  // Delete company
  $scope.deleteCompany = (company) => {
    if (confirm("Are you sure you want to delete " + company.name + "?")) {
      $.ajax({
        url: `/api/admin/company/${company._id}`,
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        success: () => {
          alert("Company deleted successfully!")
          $scope.loadCompanies()
        },
        error: (xhr) => {
          alert(xhr.responseJSON ? xhr.responseJSON.message : "Failed to delete company. Please try again.")
        },
      })
    }
  }

  // View application
  $scope.viewApplication = (application) => {
    // In a real app, this would open a modal or navigate to a details page
    alert("Viewing application for " + application.position + " at " + application.company)
  }

  // Update application status
  $scope.statusData = {
    status: "",
    interviewDate: "",
    interviewTime: "",
    interviewLocation: "",
    notes: "",
  }

  $scope.updateApplicationStatus = (application) => {
    $scope.currentApplication = application
    $scope.statusData = {
      status: application.status,
      interviewDate: "",
      interviewTime: "",
      interviewLocation: "",
      notes: application.notes || "",
    }

    $("#updateStatusModal").modal("show")
  }

  // Save application status
  $scope.saveApplicationStatus = () => {
    const data = {
      status: $scope.statusData.status,
      notes: $scope.statusData.notes,
    }

    if ($scope.statusData.status === "interview") {
      data.interviewDate = $scope.statusData.interviewDate
      data.interviewLocation = $scope.statusData.interviewLocation
    }

    $.ajax({
      url: `/api/admin/application/${$scope.currentApplication._id}`,
      method: "PUT",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      contentType: "application/json",
      data: JSON.stringify(data),
      success: () => {
        alert("Application status updated successfully!")
        $scope.loadApplications()
        $("#updateStatusModal").modal("hide")
      },
      error: (xhr) => {
        alert(xhr.responseJSON ? xhr.responseJSON.message : "Failed to update status. Please try again.")
      },
    })
  }

  // Export student data
  $scope.exportStudentData = () => {
    // In a real app, this would generate a CSV or Excel file
    alert("Exporting student data...")
  }

  // Export application data
  $scope.exportApplicationData = () => {
    // In a real app, this would generate a CSV or Excel file
    alert("Exporting application data...")
  }

  // Generate report
  $scope.generateReport = () => {
    // In a real app, this would generate a PDF report
    alert("Generating detailed placement report...")
  }

  // Change password
  $scope.passwordData = {
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  }

  $scope.changePassword = () => {
    $.ajax({
      url: "/api/auth/change-password",
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      contentType: "application/json",
      data: JSON.stringify({
        currentPassword: $scope.passwordData.currentPassword,
        newPassword: $scope.passwordData.newPassword,
      }),
      success: () => {
        alert("Password changed successfully!")
        $scope.$apply(() => {
          $scope.passwordData = {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          }
        })
        $("#changePasswordModal").modal("hide")
      },
      error: (xhr) => {
        alert(xhr.responseJSON ? xhr.responseJSON.message : "Failed to change password. Please try again.")
      },
    })
  }
})

// Helper function to update charts
function updateCharts(stats) {
  // Application Status Chart
  var statusCtx = document.getElementById("applicationStatusChart")
  if (statusCtx) {
    var statusChart = new Chart(statusCtx.getContext("2d"), {
      type: "pie",
      data: {
        labels: ["Pending", "Interview", "Accepted", "Rejected"],
        datasets: [
          {
            data: [
              stats.statusStats?.pending || 0,
              stats.statusStats?.interview || 0,
              stats.statusStats?.accepted || 0,
              stats.statusStats?.rejected || 0,
            ],
            backgroundColor: ["#ffc107", "#17a2b8", "#28a745", "#dc3545"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    })
  }

  // Other charts would be updated similarly
}

