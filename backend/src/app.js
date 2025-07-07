require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { appLogger } = require('./config/logger');

const authRoutes = require('./routes/auth-routes');
const circuitosRoutes = require('./routes/circuitos-routes');
const eleccionesRoutes = require('./routes/elecciones-routes');
const votosRoutes = require('./routes/votos-routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Muchas request enviadas desde esta IP, por favor bajá un cambio loco.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: {
      write: (message) => appLogger.info(message.trim()),
    },
  })
);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'servicio-de-votaciones-backend',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/circuitos', circuitosRoutes);
app.use('/api/elecciones', eleccionesRoutes);
app.use('/api/votos', votosRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Esta ruta no existe, a dónde vas pillín?',
    path: req.originalUrl,
  });
});

app.listen(PORT, () => {
  appLogger.info(`Servidor corriendo en puerto ${PORT}`);
  appLogger.info(`Entorno: ${process.env.NODE_ENV}`);
});

module.exports = app;
