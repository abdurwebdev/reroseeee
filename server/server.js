const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./config/db");
const Course = require("./models/Course");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/student");
const reviewRouter = require("./routes/review");
const freeVideoRoutes = require("./routes/freeVideoRoutes");
const manageUserRoute = require("./routes/manageUser");
// Routes for different features
const notificationRoutes = require('./routes/notificationRoutes');
const livestreamRoutes = require('./routes/liveStreamRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const channelRoutes = require('./routes/channelRoutes');
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("API is running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/reviews", reviewRouter);
app.use("/api/free-videos", freeVideoRoutes);
app.use("/api/users", manageUserRoute);
app.use("/api/livestream", livestreamRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/channels', channelRoutes);
// Protected route for testing auth middleware
app.get(
  "/api/protected",
  require("./middleware/authMiddleware").protect,
  (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
  }
);

// ✅ This route already exists in `admin.js`, so you could optionally remove this one if redundant
app.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Error fetching course details" });
  }
});

// ✅ Public route to get all courses for students
app.get("/api/student/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Error fetching courses" });
  }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
