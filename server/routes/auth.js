const express = require("express");
const { registerUser, loginUser, logoutUser, updateProfile, handleUpload, authMiddleware } = require("../controllers/authController");
const router = express.Router();
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");

// router.post("/register",handleUpload, registerUser);
// router.post("/login", loginUser);
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

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 60 * 60 * 1000,
      });

      // Check if the user is the specific admin email
      if (req.user.email === 'iabdurrehman12345@gmail.com') {
        // Redirect to admin auth success page for the specific email
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/admin-auth-success?token=${token}`);
      } else {
        // Redirect to frontend with token for other users
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth-success?token=${token}`);
      }
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
  }
);

module.exports = router;
