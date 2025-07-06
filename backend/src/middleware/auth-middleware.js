const jwt = require('jsonwebtoken');
const { appLogger } = require('../config/logger');

const autenticar = (tiposPermitidos = []) => {
  return async (req, res, next) => {
    try {
      let token;

      // Checkeamos si viene en una cookie o en el header Authorization
      if (req.cookies && req.cookies[process.env.COOKIE_NAME]) {
        token = req.cookies[process.env.COOKIE_NAME];
      }
      else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        appLogger.warn('No se proporcionó token', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl,
        });
        return res.status(401).json({
          message: 'Acceso denegado. No se proporcionó token de autenticación.',
        });
      }

      // Si tenemos un token, verificamos que lo hayamos emitido con nuestro secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Despues validamos si el tipo de usuario es permitido para el endpoint
      if (tiposPermitidos.length > 0 && !tiposPermitidos.includes(decoded.tipo)) {
        appLogger.warn('Tipo de usuario no autorizado', {
          credencial: decoded.credencial,
          tipo: decoded.tipo,
          tiposPermitidos,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl,
        });
        return res.status(403).json({
          message: 'Acceso denegado. Tipo de usuario no autorizado para este endpoint.',
        });
      }

      req.user = {
        nro_credencial: decoded.credencial,
        nombre_completo: decoded.nombre,
        tipo: decoded.tipo,
      };

      appLogger.info('Usuario autenticado exitosamente', {
        credencial: decoded.credencial,
        tipo: decoded.tipo,
        ip: req.ip,
        url: req.originalUrl,
      });

      next();
    } catch (error) {
      appLogger.error('Error de autenticación', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Token inválido',
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token expirado',
        });
      }

      return res.status(500).json({
        message: 'Error interno del servidor durante la autenticación.',
      });
    }
  };
};


module.exports = {
  autenticar
};
