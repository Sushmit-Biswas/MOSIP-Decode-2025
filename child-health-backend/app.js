const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
require('dotenv').config();

// Connect to MongoDB (module-level so serverless instances reuse connection when possible)
connectDB();

const app = express();

// Configure CORS to allow local dev and the Vercel frontend domain
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'https://mosip-decode-2025.vercel.app'
].filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: This origin is not allowed'));
  },
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust reverse proxy (needed for secure cookies and correct client IPs when behind platforms like Vercel)
app.set('trust proxy', 1);

console.log('📥 Allowed CORS origins:', allowedOrigins);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Child Health Record API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/children', require('./routes/children'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sync', require('./routes/sync'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = app;
