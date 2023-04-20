// app.js

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

const app = express();

// Middleware for parsing JSON request bodies
app.use(express.json());

// Configure session middleware
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
}));

// Configure Passport.js middleware
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }
    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.log('Error connecting to MongoDB:', error));

// Routes

// Login route
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

// Logout route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Protected routes

// Admin route
app.get('/admin', isLoggedIn, isAdmin, (req, res) => {
  res.send('Welcome, org admin!');
});

// Volunteer route
app.get('/volunteer', isLoggedIn, isVolunteer, (req, res) => {
  res.send('Welcome, org volunteer!');
});

// Super admin route
app.get('/superadmin', isLoggedIn, isSuperAdmin, (req, res) => {
  res.send('Welcome, super admin!');
});

// Middleware for checking if user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Middleware for checking if user is an admin
function isAdmin(req, res, next) {
  if (req.user.role === 'admin') {
    return next();
  }
  res.redirect('/');
}

// Middleware for checking if user is a volunteer
function isVolunteer(req, res, next) {
  if (req.user.role === 'volunteer') {
    return next();
  }
  res.redirect('/');
}

// Middleware for checking if user is a super admin
function isSuperAdmin(req, res, next) {
  if (req.user.role === 'superadmin') {
    return next();
  }
  res.redirect('/');
}

// Start server
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
