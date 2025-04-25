const User = require("../models/User");

const getPurchasedCourses = async (req, res) => {
  try {
    // Fetch the logged-in user from the request (from protect middleware)
    const userId = req.user.id;

    // Find the user and populate their purchasedCourses
    const user = await User.findById(userId).populate("purchasedCourses");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the purchased courses
    res.status(200).json(user.purchasedCourses);
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getPurchasedCourses };
