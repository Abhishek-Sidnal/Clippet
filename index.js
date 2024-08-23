const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const userRoutes = require('./routes/userRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(session({
    secret: process.env.SECT_KEY,
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);

mongoose.connect(process.env.DB_URL)
    .then(() => {
        app.listen(5000, () => {
            console.log("Server is running on port 5000");
            console.log("Server running on port 3000");
            console.log("Current Directory: ", __dirname);
        });
    })
    .catch(error => console.log("DB error", error));
