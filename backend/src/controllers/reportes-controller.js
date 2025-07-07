const ReportesModel = require('../models/reportes-model');
const { appLogger } = require('../config/logger');

class ReportesController {
  /**
   * Obtiene resultados por lista en un circuito específico
   */
  static async getResultadosPorListaEnCircuito(req, res) {
    try {
      const { direccion, numero, eleccionId } = req.params;

      const resultados = await ReportesModel.getResultadosPorListaEnCircuito(direccion, numero, parseInt(eleccionId));

      appLogger.info('Consulta de resultados por lista en circuito', {
        direccion,
        numero,
        eleccionId,
        usuario: req.user.credencial,
      });

      res.status(200).json({
        success: true,
        data: resultados,
        meta: {
          tipo: 'resultados_por_lista',
          circuito: `${direccion} - ${numero}`,
          eleccion: eleccionId,
        },
      });
    } catch (error) {
      appLogger.error('Error al obtener resultados por lista en circuito', {
        error: error.message,
        direccion: req.params.direccion,
        numero: req.params.numero,
        eleccionId: req.params.eleccionId,
        usuario: req.user?.credencial,
      });

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener resultados',
      });
    }
  }

  /**
   * Obtiene resultados agregados por partido en un circuito específico
   */
  static async getResultadosAgregadosPorPartidoEnCircuito(req, res) {
    try {
      const { direccion, numero, eleccionId } = req.params;

      const resultados = await ReportesModel.getResultadosAgregadosPorPartidoEnCircuito(direccion, numero, parseInt(eleccionId));

      appLogger.info('Consulta de resultados agregados por partido en circuito', {
        direccion,
        numero,
        eleccionId,
        usuario: req.user.credencial,
      });

      res.status(200).json({
        success: true,
        data: resultados,
        meta: {
          tipo: 'resultados_agregados_por_partido',
          circuito: `${direccion} - ${numero}`,
          eleccion: eleccionId,
        },
      });
    } catch (error) {
      appLogger.error('Error al obtener resultados agregados por partido en circuito', {
        error: error.message,
        direccion: req.params.direccion,
        numero: req.params.numero,
        eleccionId: req.params.eleccionId,
        usuario: req.user?.credencial,
      });

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener resultados',
      });
    }
  }

  /**
   * Obtiene resultados por candidato en un circuito específico
   */
  static async getResultadosPorCandidatoEnCircuito(req, res) {
    try {
      const { direccion, numero, eleccionId } = req.params;

      const resultados = await ReportesModel.getResultadosPorCandidatoEnCircuito(direccion, numero, parseInt(eleccionId));

      appLogger.info('Consulta de resultados por candidato en circuito', {
        direccion,
        numero,
        eleccionId,
        usuario: req.user.credencial,
      });

      res.status(200).json({
        success: true,
        data: resultados,
        meta: {
          tipo: 'resultados_por_candidato',
          circuito: `${direccion} - ${numero}`,
          eleccion: eleccionId,
        },
      });
    } catch (error) {
      appLogger.error('Error al obtener resultados por candidato en circuito', {
        error: error.message,
        direccion: req.params.direccion,
        numero: req.params.numero,
        eleccionId: req.params.eleccionId,
        usuario: req.user?.credencial,
      });

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener resultados',
      });
    }
  }

  /**
   * Obtiene resultados agregados por partido en un departamento específico
   */
  static async getResultadosPorPartidoEnDepartamento(req, res) {
    try {
      const { departamentoId, eleccionId } = req.params;

      const resultados = await ReportesModel.getResultadosPorPartidoEnDepartamento(
        parseInt(departamentoId),
        parseInt(eleccionId)
      );

      appLogger.info('Consulta de resultados por partido en departamento', {
        departamentoId,
        eleccionId,
        usuario: req.user.credencial,
      });

      res.status(200).json({
        success: true,
        data: resultados,
        meta: {
          tipo: 'resultados_por_partido_departamento',
          departamento: departamentoId,
          eleccion: eleccionId,
        },
      });
    } catch (error) {
      appLogger.error('Error al obtener resultados por partido en departamento', {
        error: error.message,
        departamentoId: req.params.departamentoId,
        eleccionId: req.params.eleccionId,
        usuario: req.user?.credencial,
      });

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener resultados',
      });
    }
  }

  /**
   * Obtiene resultados por candidato en un departamento específico
   */
  static async getResultadosPorCandidatoEnDepartamento(req, res) {
    try {
      const { departamentoId, eleccionId } = req.params;

      const resultados = await ReportesModel.getResultadosPorCandidatoEnDepartamento(
        parseInt(departamentoId),
        parseInt(eleccionId)
      );

      appLogger.info('Consulta de resultados por candidato en departamento', {
        departamentoId,
        eleccionId,
        usuario: req.user.credencial,
      });

      res.status(200).json({
        success: true,
        data: resultados,
        meta: {
          tipo: 'resultados_por_candidato_departamento',
          departamento: departamentoId,
          eleccion: eleccionId,
        },
      });
    } catch (error) {
      appLogger.error('Error al obtener resultados por candidato en departamento', {
        error: error.message,
        departamentoId: req.params.departamentoId,
        eleccionId: req.params.eleccionId,
        usuario: req.user?.credencial,
      });

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener resultados',
      });
    }
  }

  /**
   * Obtiene los candidatos ganadores por departamento
   */
  static async getCandidatosGanadoresPorDepartamento(req, res) {
    try {
      const { eleccionId } = req.params;

      const resultados = await ReportesModel.getCandidatosGanadoresPorDepartamento(parseInt(eleccionId));

      appLogger.info('Consulta de candidatos ganadores por departamento', {
        eleccionId,
        usuario: req.user.credencial,
      });

      res.status(200).json({
        success: true,
        data: resultados,
        meta: {
          tipo: 'candidatos_ganadores_departamento',
          eleccion: eleccionId,
        },
      });
    } catch (error) {
      appLogger.error('Error al obtener candidatos ganadores por departamento', {
        error: error.message,
        eleccionId: req.params.eleccionId,
        usuario: req.user?.credencial,
      });

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener resultados',
      });
    }
  }
}

module.exports = ReportesController;
