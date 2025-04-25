const express = require("express");
const router = express.Router();
const Review = require("../models/Review"); // Import Mongoose model

// Get all reviews for a specific course
router.get("/:courseId", async (req, res) => {
  try {
    const reviews = await Review.find({ courseId: req.params.courseId });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
  }
});

// Post a new review
router.post("/", async (req, res) => {
  const { courseId, studentName, comment } = req.body;
  if (!courseId || !studentName || !comment) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newReview = new Review({ courseId, studentName, comment });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: "Error adding review", error });
  }
});

module.exports = router;
