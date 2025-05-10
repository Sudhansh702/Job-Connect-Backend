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

app.use(cors());
app.use(bodyParser.json());

// authentication route

app.use("/", require("./routes/auth.js"));
app.use("/api", require("./routes/api/jobs.js"));
app.use("/",require('./routes/applicaion.js'))

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
