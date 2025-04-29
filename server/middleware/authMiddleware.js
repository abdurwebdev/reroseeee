const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Middleware to Protect Routes (Authentication)
const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token in cookies, check Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If still no token, check query parameter (for WebSocket connections)
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  // If no token found anywhere, return unauthorized
  if (!token) {
    return res.status(401).json({
      message: "Authentication required. No token found in cookies, headers, or query parameters."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password"); // Get user from DB, excluding password

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
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
