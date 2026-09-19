const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const employerRoutes = require('./routes/employerRoutes');
const jobRoutes = require('./routes/jobRoutes');
const authxRoutes = require('./routes/authxRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Request Body Parsing (with 10mb limit for avatar uploads)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'InstaJobs Backend API Server is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Public Job Discovery Routes
app.use('/api/jobs', jobRoutes);

// Authentication & Registration Routes
app.use('/api/auth', authRoutes);

// Candidate Profile Routes
app.use('/api/candidate', candidateRoutes);

// Employer Job Management Routes
app.use('/api/employer', employerRoutes);

// AuthX Integration Foundation Routes (Phase 1)
app.use('/api/v1/authx', authxRoutes);

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` InstaJobs Backend API Server running on port ${PORT} `);
  console.log(` Health Check: http://localhost:${PORT}/api/health `);
  console.log(`=================================================`);
});
