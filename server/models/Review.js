const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  studentName: { type: String, required: true },
  comment: { type: String, required: true },
});

module.exports = mongoose.model("Review", ReviewSchema);
