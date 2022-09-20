import passport from 'passport';
import passport_google from 'passport-google-oauth20';
import Employee from '../models/employee.js';
import dotenv from 'dotenv';
dotenv.config();
const GoogleStrategy = passport_google.Strategy;

passport.serializeUser(function (employee, done) {
  done(null, employee.id);
});

passport.deserializeUser(function (id, done) {
  Employee.findById(id, function (err, employee) {
    done(err, employee);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5555/google/callback',
    },
    async function (accessToken, refreshToken, profile, cb) {
      Employee.findOrCreate({ email: profile._json.email }, function (err, employee) {
        return cb(err, employee);
      });
    }
  )
);
