const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // For development, set to true in production
}));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mock user data
const users = [
  { id: 1, name: 'Jonathan Jones', email: 'jonathan@gmail.com', address: '96 Ocean Drive', pincode: '001122' }
];

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Root route to serve the home page
app.get('/', (req, res) => {
  res.render('index');
});

// Profile route (protected)
app.get('/profile', isAuthenticated, (req, res) => {
  const user = users.find(u => u.id === req.session.user.id);
  res.render('profile', { user });
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

// Login form submission
app.post('/login', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (user) {
    req.session.user = user;
    res.redirect('/profile');
  } else {
    res.redirect('/login');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
