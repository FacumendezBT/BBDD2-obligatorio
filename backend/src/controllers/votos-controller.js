const VotosModel = require('../models/votos-model');
const { appLogger } = require('../config/logger');

class VotosController {
  static async enviarVoto(req, res, next) {
    try {
      const votoData = req.body;

      // Extraer los IDs de las elecciones del objeto papeletas_por_eleccion
      const eleccionesIds = Object.keys(votoData.papeletas_por_eleccion || {}).map((id) => parseInt(id));

      if (eleccionesIds.length === 0) {
        throw new Error('Debe haber al menos una elección para votar');
      }

      // Validar todas las elecciones
      const validacion = await VotosModel.validarVoto({
        ciudadano_credencial: votoData.ciudadano_credencial,
        elecciones_ids: eleccionesIds,
        circuito_direccion: votoData.circuito_direccion,
        circuito_numero: votoData.circuito_numero,
      });

      if (!validacion.valido) {
        throw new Error(validacion.mensaje);
      }

      const resultado = await VotosModel.enviarVoto(votoData);

      appLogger.info('Voto enviado exitosamente', {
        transaccionId: resultado.transaccion_id,
        ciudadano: votoData.ciudadano_credencial,
        elecciones: eleccionesIds,
        totalElecciones: resultado.total_elecciones,
      });

      res.status(201).json({
        transaccion_id: resultado.transaccion_id,
        votos: resultado.votos,
        total_elecciones: resultado.total_elecciones,
        mensaje: `Voto registrado exitosamente para ${resultado.total_elecciones} elección(es)`,
      });
    } catch (error) {
      appLogger.warn('Error enviando voto', {
        error: error.message,
        ciudadano: req.body.ciudadano_credencial,
        elecciones: req.body.papeletas_por_eleccion ? Object.keys(req.body.papeletas_por_eleccion) : [],
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (true) {
        case error.message.includes('ya ha votado en esta elección'):
          return res.status(400).json({
            message: error.message,
          });
        case error.message.includes('no está activa'):
          return res.status(400).json({
            message: error.message,
          });
        case error.message.includes('no corresponde al ciudadano'):
          return res.status(400).json({
            message: error.message,
          });
        case error.message.includes('no está abierta'):
          return res.status(400).json({
            message: error.message,
          });
        case error.message.includes('Debe haber al menos una elección'):
          return res.status(400).json({
            message: error.message,
          });
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }

  static async validarVoto(req, res, next) {
    try {
      const votoData = req.body;

      const validacion = await VotosModel.validarVoto(votoData);

      if (!validacion.valido) {
        throw new Error(validacion.mensaje);
      }

      res.status(200).json({
        valido: true,
        message: validacion.mensaje,
      });
    } catch (error) {
      appLogger.warn('Error validando voto', {
        error: error.message,
        ciudadano: req.body.ciudadano_credencial,
        elecciones: req.body.elecciones_ids,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (true) {
        case error.message.includes('ya ha votado en esta elección'):
          return res.status(400).json({
            message: error.message,
          });
        case error.message.includes('no está activa'):
          return res.status(400).json({
            message: error.message,
          });
        case error.message.includes('no corresponde al ciudadano'):
          return res.status(400).json({
            message: error.message,
          });
        case error.message.includes('no está abierta'):
          return res.status(400).json({
            message: error.message,
          });
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }

  static async obtenerEstadoVotacion(req, res, next) {
    try {
      const { idEleccion } = req.params;

      const estado = await VotosModel.obtenerEstadoVotacion(idEleccion);

      if (!estado) {
        throw new Error('Elección no encontrada');
      }

      res.status(200).json(estado);
    } catch (error) {
      appLogger.warn('Error obteniendo estado de votación', {
        error: error.message,
        eleccionId: req.params.idEleccion,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (error.message) {
        case 'Elección no encontrada':
          return res.status(404).json({
            message: 'Elección no encontrada',
          });
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }

  static async aprobarVoto(req, res, next) {
    try {
      const { idVoto } = req.params;
      const { credencial_integrante } = req.body;

      const resultado = await VotosModel.aprobarVoto(idVoto, credencial_integrante);

      appLogger.info('Voto aprobado', {
        votoId: idVoto,
        integranteMesa: credencial_integrante,
      });

      res.status(200).json(resultado);
    } catch (error) {
      appLogger.warn('Error aprobando voto', {
        error: error.message,
        votoId: req.params.idVoto,
        integranteMesa: req.body.credencial_integrante,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (error.message) {
        case 'Voto no encontrado':
          return res.status(404).json({
            message: 'Voto no encontrado',
          });
        case 'El voto no está en estado observado':
          return res.status(400).json({
            message: 'El voto no está en estado observado',
          });
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }

  static async obtenerVotosPorCircuito(req, res, next) {
    try {
      const { direccionCircuito, numeroCircuito } = req.params;

      const votos = await VotosModel.obtenerVotosPorCircuito(direccionCircuito, numeroCircuito);

      res.status(200).json(votos);
    } catch (error) {
      appLogger.warn('Error obteniendo votos por circuito', {
        error: error.message,
        direccionCircuito: req.params.direccionCircuito,
        numeroCircuito: req.params.numeroCircuito,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (error.message) {
        case 'Circuito no encontrado':
          return res.status(404).json({
            message: 'Circuito no encontrado',
          });
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }
}

module.exports = VotosController;
