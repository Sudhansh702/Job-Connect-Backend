const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
require("dotenv").config();
const connectDB = require("./config/db.js");
connectDB()

const app = express();
const PORT = 5000;
app.use(cors({
  origin: ['https://job-connect-frontend-eight.vercel.app','http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// app.options('*', cors());

app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/", require("./routes/auth.js"));
app.use("/api", require("./routes/api/jobs.js"));
app.use("/", require('./routes/applicaion.js'));

app.listen(PORT, () => console.log(`Server running on Port: ${PORT}`));
