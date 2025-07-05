const CiudadanoModel = require('../models/ciudadano-model');
const { appLogger } = require('../config/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const EleccionModel = require('../models/eleccion-model');

class AuthController {
  // Si quiere votar hay que validar que el usuario no haya votado ya, y que exista una elección activa.
  static async _caminoUsuarioQuiereVotar(credencial) {
    const eleccionesActivas = await EleccionModel.traerEleccionesActivas();
    if (eleccionesActivas.length === 0) {
      throw new Error('No hay elecciones activas');
    }

    let countYaVoto = 0;
    for (const eleccion of eleccionesActivas) {
      const yaVoto = await CiudadanoModel.yaVoto(credencial, eleccion.id);
      if (yaVoto) {
        countYaVoto++;
      }
    }
    if (eleccionesActivas.length === countYaVoto) {
      throw new Error('El usuario ya votó en todas las elecciones activas');
    }
  }

  static async login(req, res, next) {
    const { credencial, password } = req.body;
    try {
      let userFinal = null;
      // Si no hay password es un login sin contraseña (solo permiso de votante)
      if (!password) {
        const ciudadano = await CiudadanoModel.findciudadano(credencial);
        if (!ciudadano) throw new Error('Credencial inválida');

        await AuthController._caminoUsuarioQuiereVotar(credencial);

        userFinal = ciudadano;
      } else {
        const user = await CiudadanoModel.findByCredencial(credencial);
        const isPasswordValid = await bcrypt.compare(password, user ? user.contraseña : '');

        if (!user || !isPasswordValid) throw new Error('Credencial inválida');

        userFinal = user;
      }

      const tokenito = jwt.sign(
        {
          credencial: userFinal.nro_credencial,
          nombre: userFinal.nombre_completo,
          tipo: userFinal.user_type,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        }
      );

      res.cookie(process.env.COOKIE_NAME, tokenito, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 horitas
        path: '/',
      });

      appLogger.info('Login exitoso', {
        credencial: userFinal.nro_credencial,
        nombre: userFinal.nombre_completo,
        ip: req.ip,
      });

      res.status(200).json({
        user: {
          credencial: userFinal.nro_credencial,
          nombre: userFinal.nombre_completo,
          cedula: userFinal.cedula_identidad,
          tipo: userFinal.user_type,
        },
        tokenito,
      });
    } catch (error) {
      appLogger.warn('Error en el login', {
        error: error.message,
        credencial: credencial || 'N/A',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Para que el front se base en los códigos de error y no en los mensajes
      switch (error.message) {
        case 'Credencial inválida':
          return res.status(401).json({
            message: 'Credenciales inválidas',
          });
        case 'No hay elecciones activas':
          return res.status(403).json({
            message: 'No hay elecciones activas',
          });
        case 'El usuario ya votó en todas las elecciones activas':
          return res.status(403).json({
            message: 'El usuario ya votó en todas las elecciones activas',
          });
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }

  static async logout(req, res, next) {
    res.clearCookie(process.env.COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    if (req.user) {
      appLogger.info('Logout exitoso', {
        credencial: req.user.credencial,
        nombre: req.user.nombre,
        ip: req.ip,
      });
    }

    res.status(200).json({
      message: 'Sesión cerrada exitosamente',
    });
  }
}

module.exports = AuthController;
