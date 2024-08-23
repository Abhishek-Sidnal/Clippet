const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/users', userRoutes);

mongoose.connect(process.env.DB_URL)
    .then(() => {
        app.listen(5000, () => console.log("Server is running on port 5000"));
    })
    .catch(error => console.log("DB error", error));
