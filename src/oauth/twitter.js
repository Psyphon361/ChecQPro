import passport from 'passport';
import passport_twitter from 'passport-twitter';
import Employee from '../models/employee.js';
import dotenv from 'dotenv';
dotenv.config();
const TwitterStrategy = passport_twitter.Strategy;

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: 'http://localhost:5555/twitter/callback',
      scope: ['employee:email'],
    },
    function (token, tokenSecret, profile, cb) {
      console.log(profile);
      Employee.findOrCreate(
        { email: profile.username + '@gmail.com' },
        function (err, employee) {
          return cb(err, employee);
        }
      );
    }
  )
);
