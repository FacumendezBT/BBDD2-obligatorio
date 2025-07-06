require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { testConnection } = require('./config/database');
const { appLogger } = require('./config/logger');

// Importar rutas
const authRoutes = require('./routes/auth-routes');
const circuitosRoutes = require('./routes/circuitos-routes');
// const electionRoutes = require('./routes/election-routes');
// const voteRoutes = require('./routes/vote-routes');
// const reportRoutes = require('./routes/report-routes');
// const circuitRoutes = require('./routes/circuit-routes');

const app = express();
const PORT = process.env.PORT || 8080;

// Seguridad
app.use(helmet());
app.use(compression());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Limitador de peticiones
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logger HTTP
app.use(
  morgan('combined', {
    stream: {
      write: (message) => appLogger.info(message.trim()),
    },
  })
);

// Ruta de prueba de vida (healthcheck)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'voting-service-backend',
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/circuitos', circuitosRoutes);
// app.use('/api/elections', electionRoutes);
// app.use('/api/votes', voteRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/circuits', circuitRoutes);

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Conexión a la base de datos y arranque del servidor
testConnection()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      appLogger.info(`✅ Voting service backend running on port ${PORT}`);
      appLogger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    appLogger.error('⛔ No se pudo iniciar el backend porque falló la conexión a la base de datos.');
    appLogger.error(err);
    process.exit(1);
  });

module.exports = app;
