const EleccionModel = require('../models/eleccion-model');
const { appLogger } = require('../config/logger');
const CircuitosModel = require('../models/circuitos-model');

class EleccionController {
  static async getTotalElecciones(req, res, next) {
    try {
      const elections = await EleccionModel.getEleccionesHistoricas();

      res.status(200).json(elections);
    } catch (error) {
      appLogger.warn('Error obteniendo todas las elecciones', {
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

  static async getEleccionPorId(req, res, next) {
    try {
      const { electionId } = req.params;

      const election = await EleccionModel.getEleccionById(electionId);

      if (!election) {
        throw new Error('Elección no encontrada');
      }

      res.status(200).json({
          election,
        });
    } catch (error) {
      appLogger.warn('Error obteniendo elección por ID', {
        error: error.message,
        electionId: req.params.electionId,
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

  static async getEleccionesActivas(req, res, next) {
    try {
      const elections = await EleccionModel.traerEleccionesActivas();

      res.status(200).json(elections);
    } catch (error) {
      appLogger.warn('Error obteniendo elecciones activas', {
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

  static async getEleccionesFuturas(req, res, next) {
    try {
      const elections = await EleccionModel.getFuturasElecciones();

      res.status(200).json(elections);
    } catch (error) {
      appLogger.warn('Error obteniendo elecciones futuras', {
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

  static async getEleccionesPasadas(req, res, next) {
    try {
      const elections = await EleccionModel.getEleccionesPasadas();

      res.status(200).json(elections);
    } catch (error) {
      appLogger.warn('Error obteniendo elecciones pasadas', {
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

  static async getPapeletasEleccion(req, res, next) {
    try {
      const { electionId } = req.params;

      const election = await EleccionModel.getEleccionById(electionId);
      if (!election) {
        throw new Error('Elección no encontrada');
      }

      let papeletas;
      
      // Si es Presidencial o Ballotage, devolver listas, sino papeletas comunes
      if (election.tipo === 'Presidencial') {
        const circuitoTotem = await CircuitosModel.getNroCircuitoDeTotem(req.ip);
        const circuitoDepto = await CircuitosModel.getInfoCircuito(circuitoTotem.direccion, circuitoTotem.numero);
        
        // Obtener listas y participantes por separado
        const listas = await EleccionModel.getListasEleccionPresidencial(electionId, circuitoDepto.departamento_id);
        const participantes = await EleccionModel.getParticipantesListasPresidencial(electionId, circuitoDepto.departamento_id);
        
        // Combinar listas con sus participantes
        papeletas = EleccionController.combinarListasConParticipantes(listas, participantes);
      } else if (election.tipo === 'Ballotage') {
        // Obtener listas y participantes por separado
        const listas = await EleccionModel.getListasEleccion(electionId);
        const participantes = await EleccionModel.getParticipantesListas(electionId);
        
        // Combinar listas con sus participantes
        papeletas = EleccionController.combinarListasConParticipantes(listas, participantes);
      } else {
        papeletas = await EleccionModel.getPapeletasComunesEnEleccion(electionId);
      }

      res.status(200).json(papeletas);
    } catch (error) {
      appLogger.warn('Error obteniendo papeletas de elección', {
        error: error.message,
        electionId: req.params.electionId,
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

  static async crearEleccion(req, res, next) {
    try {
      const { nombre, tipo, fecha_hora_inicio, fecha_hora_fin } = req.body;

      const startDate = new Date(fecha_hora_inicio);
      const endDate = new Date(fecha_hora_fin);
      const now = new Date();

      if (startDate >= endDate) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }

      if (endDate <= now) {
        throw new Error('La fecha de fin debe ser futura');
      }

      const electionData = {
        nombre,
        tipo,
        fecha_hora_inicio,
        fecha_hora_fin,
      };

      const newElection = await EleccionModel.crearEleccion(electionData);

      appLogger.info('Nueva elección creada', {
        election_id: newElection.id,
        nombre: newElection.nombre,
        tipo: newElection.tipo,
        created_by: req.user?.nro_credencial,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json(newElection);
    } catch (error) {
      appLogger.warn('Error creando elección', {
        error: error.message,
        nombre: req.body.nombre,
        tipo: req.body.tipo,
        created_by: req.user?.nro_credencial,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      switch (error.message) {
        case 'La fecha de inicio debe ser anterior a la fecha de fin':
          return res.status(400).json({
            message: 'La fecha de inicio debe ser anterior a la fecha de fin',
          });
        case 'La fecha de fin debe ser futura':
          return res.status(400).json({
            message: 'La fecha de fin debe ser futura',
          });
        default:
          return res.status(500).json({
            message: 'Error interno del servidor',
          });
      }
    }
  }

  static async checkEstadoEleccion(req, res, next) {
    try {
      const { electionId } = req.params;

      const election = await EleccionModel.getEleccionById(electionId);
      if (!election) {
        throw new Error('Elección no encontrada');
      }

      const now = new Date();
      const startDate = new Date(election.fecha_hora_inicio);
      const endDate = new Date(election.fecha_hora_fin);

      let status;
      if (now < startDate) {
        status = 'futura';
      } else if (now >= startDate && now <= endDate) {
        status = 'activa';
      } else {
        status = 'finalizada';
      }

      res.status(200).json(status);
    } catch (error) {
      appLogger.warn('Error verificando estado de elección', {
        error: error.message,
        electionId: req.params.electionId,
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

  static combinarListasConParticipantes(listas, participantes) {
    const participantesPorLista = {};
    
    participantes.forEach(participante => {
      const key = `${participante.fk_partido_id}-${participante.fk_papeleta_id}`;
      
      if (!participantesPorLista[key]) {
        participantesPorLista[key] = [];
      }
      
      participantesPorLista[key].push({
        participante_credencial: participante.participante_credencial,
        participante_nombre: participante.participante_nombre,
        organo_candidato: participante.organo_candidato,
        participante_orden: participante.participante_orden
      });
    });

    return listas.map(lista => {
      const key = `${lista.fk_partido_id}-${lista.fk_papeleta_id}`;
      
      return {
        ...lista,
        participantes: participantesPorLista[key] || []
      };
    });
  }
}

module.exports = EleccionController;
