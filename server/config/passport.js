// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract the Google profile picture URL
        const avatarUrl =
          profile.photos && profile.photos[0] ? profile.photos[0].value : "";

        // 1. Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // If user exists but doesn't have a googleId, link them
          let isUpdated = false;

          if (!user.googleId) {
            user.googleId = profile.id;
            user.isAccountVerified = true;
            isUpdated = true;
          }

          // If they don't have an avatar yet, let's use their Google one!
          if (!user.avatar && avatarUrl) {
            user.avatar = avatarUrl;
            isUpdated = true;
          }

          if (isUpdated) {
            await user.save();
          }

          return done(null, user);
        }

        // 2. If user doesn't exist, create a new one with the avatar
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: avatarUrl, // <-- Saving the avatar here
          isAccountVerified: true,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

export default passport;
