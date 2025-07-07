const { appLogger } = require('../config/logger.js');
const CircuitosModel = require('../models/circuitos-model.js');
const CiudadanoModel = require('../models/ciudadano-model.js');

class CircuitosController {
  static async getInfoCircuito(req, res, next) {
    const { direccion, numero } = req.params;
    try {
      const circuit = await CircuitosModel.getInfoCircuito(direccion, numero);
      if (!circuit) {
        throw new Error('Circuito no encontrado');
      }
      res.status(200).json({
        circuit,
      });
    } catch (error) {
      appLogger.warn('Error obteniendo información del circuito', {
        error: error.message,
        direccion,
        numero,
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

  static async getInfoMesa(req, res, next) {
    const { electionId, mesaNumber } = req.params;
    try {
      const mesa = await CircuitosModel.getInfoMesa(electionId, mesaNumber);
      if (!mesa) {
        throw new Error('Mesa no encontrada');
      }

      const isMesaOpen = await CircuitosModel.isMesaAbierta(electionId, mesaNumber);
      const statusHistory = await CircuitosModel.getHistorialEstadoMesa(electionId, mesaNumber);

      res.status(200).json({
        mesa,
        isOpen: isMesaOpen,
        statusHistory,
      });
    } catch (error) {
      appLogger.warn('Error obteniendo información de la mesa', {
        error: error.message,
        electionId,
        mesaNumber,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (error.message) {
        case 'Mesa no encontrada':
          return res.status(404).json({
            message: 'Mesa no encontrada',
          });
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }

  static async cerrarMesa(req, res, next) {
    const { electionId, mesaNumber } = req.params;
    try {
      const presidentCredencial = req.user.nro_credencial;

      const isPresident = await CiudadanoModel.isMesaPresidente(presidentCredencial);
      if (!isPresident) {
        throw new Error('Solo presidentes de mesa pueden cerrar la votación');
      }

      const isMesaOpen = await CircuitosModel.isMesaAbierta(electionId, mesaNumber);
      if (!isMesaOpen) {
        throw new Error('La mesa ya está cerrada');
      }

      await CircuitosModel.cerrarMesa(electionId, mesaNumber, presidentCredencial);

      appLogger.info('Mesa cerrada exitosamente', {
        election_id: electionId,
        mesa_number: mesaNumber,
        closed_by: presidentCredencial,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        message: 'Mesa cerrada exitosamente',
      });
    } catch (error) {
      appLogger.warn('Error cerrando mesa', {
        error: error.message,
        electionId,
        mesaNumber,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (error.message) {
        case 'Solo presidentes de mesa pueden cerrar la votación':
          return res.status(403).json({
            message: 'Solo presidentes de mesa pueden cerrar la votación',
          });
        case 'La mesa ya está cerrada':
          return res.status(400).json({
            message: 'La mesa ya está cerrada',
          });
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }

  static async getCircuitosPorDepartamento(req, res, next) {
    const { departmentId } = req.params;
    try {
      const circuits = await CircuitosModel.getCircuitosPorDepartamento(departmentId);

      res.status(200).json({
        circuits,
        count: circuits.length,
        departmentId,
      });
    } catch (error) {
      appLogger.warn('Error obteniendo circuitos por departamento', {
        error: error.message,
        departmentId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (error.message) {
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }

  static async getTodosCircuitos(req, res, next) {
    try {
      const circuits = await CircuitosModel.getTodosCircuitos();

      // Agurpamos los circuitos por departamento para mejor organización
      const circuitsByDepartment = circuits.reduce((acc, circuit) => {
        const dept = circuit.departamento_nombre;
        if (!acc[dept]) {
          acc[dept] = [];
        }
        acc[dept].push(circuit);
        return acc;
      }, {});

      res.status(200).json({
        circuits,
        circuitsByDepartment,
        totalCount: circuits.length,
        departmentCount: Object.keys(circuitsByDepartment).length,
      });
    } catch (error) {
      appLogger.warn('Error obteniendo todos los circuitos', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (error.message) {
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }

  static async getCircuitoAsignadoUsuario(req, res, next) {
    const { electionId } = req.params;
    try {
      const credencial = req.user.nro_credencial;

      const assignedCircuit = await CircuitosModel.getCircutoPorCredencial(credencial);
      if (!assignedCircuit) {
        throw new Error('No hay circuito asignado para esta elección');
      }

      res.status(200).json({
        assignedCircuit,
        electionId,
      });
    } catch (error) {
      appLogger.warn('Error obteniendo circuito asignado al usuario', {
        error: error.message,
        electionId,
        credencial: req.user?.nro_credencial,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (error.message) {
        case 'No hay circuito asignado para esta elección':
          return res.status(404).json({
            message: 'No hay circuito asignado para esta elección',
          });
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }

  static async nroCircuitoPorIp(req, res, next) {
    const ip = req.ip;
    try {
      const circuit = await CircuitosModel.getNroCircuitoDeTotem(ip);
      if (!circuit) throw new Error('No hay circuito asociado a este totem');
      res.status(200).json(circuit);
    } catch (error) {
      appLogger.warn('Error conectando con el circuito por IP', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (error.message) {
        case 'No hay circuito asociado a este totem':
          return res.status(404).json({
            message: 'No hay circuito asociado a este tótem',
          });
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }

  static async abrirMesa(req, res, next) {
    const { electionId, mesaNumber } = req.params;
    try {
      const presidentCredencial = req.user.nro_credencial;

      const isPresident = await CiudadanoModel.isMesaPresidente(presidentCredencial);
      if (!isPresident) {
        throw new Error('Solo presidentes de mesa pueden abrir la votación');
      }

      const estadoActual = await CircuitosModel.getEstadoActualMesa(electionId, mesaNumber);
      if (estadoActual === 'Abierto') {
        throw new Error('La mesa ya está abierta');
      }

      await CircuitosModel.abrirMesa(electionId, mesaNumber, presidentCredencial);

      appLogger.info('Mesa abierta exitosamente', {
        election_id: electionId,
        mesa_number: mesaNumber,
        opened_by: presidentCredencial,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        message: 'Mesa abierta exitosamente',
      });
    } catch (error) {
      appLogger.warn('Error abriendo mesa', {
        error: error.message,
        electionId,
        mesaNumber,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (error.message) {
        case 'Solo presidentes de mesa pueden abrir la votación':
          return res.status(403).json({
            message: 'Solo presidentes de mesa pueden abrir la votación',
          });
        case 'La mesa ya está abierta':
          return res.status(400).json({
            message: 'La mesa ya está abierta',
          });
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }
}

module.exports = CircuitosController;
