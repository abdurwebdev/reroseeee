const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists in our database
    let existingUser = await User.findOne({ googleId: profile.id });

    if (existingUser) {
      // User already exists, return the user
      return done(null, existingUser);
    }

    // Check if user exists with the same email
    let userWithEmail = await User.findOne({ email: profile.emails[0].value });

    if (userWithEmail) {
      // Link Google account to existing user
      userWithEmail.googleId = profile.id;
      await userWithEmail.save();
      return done(null, userWithEmail);
    }

    // Create new user
    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      profileImageUrl: profile.photos[0].value,
      role: profile.emails[0].value === 'iabdurrehman12345@gmail.com' ? 'admin' : 'student',
      isVerified: true // Google accounts are considered verified
    });

    const savedUser = await newUser.save();
    return done(null, savedUser);

  } catch (error) {
    console.error('Error in Google OAuth strategy:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
