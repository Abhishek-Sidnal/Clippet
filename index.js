const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const userRoutes = require('./routes/userRoutes');

const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files (e.g., CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Session configuration
app.use(session({
    secret: process.env.SECT_KEY, // Change this to a strong secret key
    resave: false,
    saveUninitialized: false
}));

// Flash messages middleware
app.use(flash());

// Global middleware to pass flash messages and current user to views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Use routes
app.use('/', userRoutes);

// Connect to MongoDB and start the server
mongoose.connect(process.env.DB_URL)
    .then(() => {
        app.listen(5000, () => {
            console.log("Server is running on port 5000");
            console.log("Server running on port 3000");
            console.log("Current Directory: ", __dirname);
        });
    })
    .catch(error => console.log("DB error", error));
