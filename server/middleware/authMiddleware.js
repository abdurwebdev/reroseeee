const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Middleware to Protect Routes (Authentication)
const protect = async (req, res, next) => {
  const token = req.cookies.token; // Get token from cookies
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password"); // Get user from DB, excluding password

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid Token" });
  }
};

// ✅ Middleware for Role-Based Authorization
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access Denied: No Role Assigned" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
