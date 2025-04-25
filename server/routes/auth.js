const express = require("express");
const { registerUser, loginUser, logoutUser, updateProfile, handleUpload, authMiddleware } = require("../controllers/authController");
const router = express.Router();
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/register",handleUpload, registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/profile", authMiddleware, handleUpload, updateProfile);
router.get("/check", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.get("/student", protect, authorizeRoles("student"), (req, res) => {
  res.json({ message: "Welcome Student" });
});

module.exports = router;
