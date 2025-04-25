// User routes
const express = require("express");
const User = require("../models/User"); // Assuming you have a User model
const router = express.Router();

// Fetch all users (Admin only)
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Delete user (Admin only)
router.delete("/:userId", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Promote to admin
router.patch("/:userId/promote", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { role: "admin" });
    res.json({ message: "User promoted to admin" });
  } catch (err) {
    res.status(500).json({ message: "Failed to promote user" });
  }
});

// Demote to student
router.patch("/:userId/demote", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { role: "student" });
    res.json({ message: "User demoted to student" });
  } catch (err) {
    res.status(500).json({ message: "Failed to demote user" });
  }
});

module.exports = router;
