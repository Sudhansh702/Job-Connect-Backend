const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
require("dotenv").config();
const connectDB = require("./config/db.js");
connectDB()

const app = express();
const PORT = 5000;
app.use(cors({
  origin: ['https://job-connect-frontend-eight.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// app.options('*', cors());

app.use(bodyParser.json());

// Routes
app.use("/", require("./routes/auth.js"));
app.use("/api", require("./routes/api/jobs.js"));
app.use("/", require('./routes/applicaion.js'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
