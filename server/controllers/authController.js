const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png) are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("profileImage");

const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, role = "student" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(403).json({ message: "Admin already exists. Only one admin is allowed." });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profileImageUrl: req.file ? `/uploads/profiles/${req.file.filename}` : null,
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    if (req.file) {
      user.profileImageUrl = `/uploads/profiles/${req.file.filename}`;
    }
    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout User
const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    expires: new Date(0),
  });

  res.json({ message: "Logout successful" });
};

module.exports = { registerUser, loginUser, logoutUser, updateProfile, handleUpload, authMiddleware };