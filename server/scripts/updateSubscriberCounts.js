/**
 * This script updates the subscriberCount field for all users based on their actual subscribers.
 * Run this script once to ensure all users have the correct subscriber count.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const updateSubscriberCounts = async () => {
  try {
    console.log('Starting subscriber count update...');
    
    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users`);
    
    let updatedCount = 0;
    
    // For each user, count how many other users have them in their subscriptions
    for (const user of users) {
      const subscriberCount = await User.countDocuments({
        subscriptions: user._id
      });
      
      // Update the user's subscriberCount if it's different
      if (user.subscriberCount !== subscriberCount) {
        await User.findByIdAndUpdate(user._id, {
          subscriberCount: subscriberCount
        });
        
        console.log(`Updated ${user.name} (${user._id}): ${user.subscriberCount || 0} -> ${subscriberCount}`);
        updatedCount++;
      }
    }
    
    console.log(`Completed! Updated ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating subscriber counts:', error);
    process.exit(1);
  }
};

updateSubscriberCounts();
