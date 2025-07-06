require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { appLogger } = require('./config/logger');

// Import routes
const authRoutes = require('./routes/auth-routes');
const circuitosRoutes = require('./routes/circuitos-routes');
const eleccionesRoutes = require('./routes/elecciones-routes');
// const electionRoutes = require('./routes/election-routes');
// const voteRoutes = require('./routes/vote-routes');
// const reportRoutes = require('./routes/report-routes');
// const circuitRoutes = require('./routes/circuit-routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging middleware
app.use(
  morgan('combined', {
    stream: {
      write: (message) => appLogger.info(message.trim()),
    },
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'voting-service-backend',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/circuitos', circuitosRoutes);
app.use('/api/elecciones', eleccionesRoutes);
// app.use('/api/elections', electionRoutes);
// app.use('/api/votes', voteRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/circuits', circuitRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

app.listen(PORT, () => {
  appLogger.info(`Voting service backend running on port ${PORT}`);
  appLogger.info(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
