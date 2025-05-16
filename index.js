const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const users = require('./users.js');
require("dotenv").config();
const connectDB = require("./config/db.js");
connectDB()

dotenv.config();
const app = express();
const PORT = 5000;

app.use(cors({
  origin: ['https://job-connect-frontend-eight.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add headers middleware for additional CORS handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(bodyParser.json());

// authentication route

app.use("/", require("./routes/auth.js"));
app.use("/api", require("./routes/api/jobs.js"));
app.use("/",require('./routes/applicaion.js'))

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
