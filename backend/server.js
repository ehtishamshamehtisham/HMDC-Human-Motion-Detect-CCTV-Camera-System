require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const recordingsRouter = require('./routes/recordings');
const { initGridFS } = require('./lib/gridfs');

const app = express();
app.use(cors());
app.use(express.json());

// Serve public frontend
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recordings', recordingsRouter);

// Connect DB + start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    
    // Initialize GridFS after DB connection
    initGridFS();
    console.log("GridFS Initialized");
    
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.log(err));