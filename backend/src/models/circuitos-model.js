const { executeQuery } = require('../config/database');
const { mysqlLogger } = require('../config/logger');

class CircuitosModel {
  static async getInfoCircuito(direccion, numero) {
    try {
      const query = `
        SELECT
          c.fk_establecimiento_direccion,
          c.nro,
          c.es_accesible,
          e.direccion as establecimiento_direccion,
          e.barrio,
          e.pueblo,
          e.ciudad_paraje,
          e.zona,
          e.tipo as establecimiento_tipo,
          d.nombre as departamento_nombre,
          d.id as departamento_id
        FROM Circuito c
        JOIN Establecimiento e ON c.fk_establecimiento_direccion = e.direccion
        JOIN Departamento d ON e.fk_departamento_id = d.id
        WHERE c.fk_establecimiento_direccion = ? AND c.nro = ?
      `;
      const results = await executeQuery(query, [direccion, numero]);
      return results[0] || null;
    } catch (error) {
      mysqlLogger.error('Error trayendo información del circuito:', error);
      throw error;
    }
  }

  static async getInfoMesa(electionId, mesaNumber) {
    try {
      const query = `
        SELECT
          fm.fk_eleccion_id,
          fm.nro_mesa,
          fm.es_accesible,
          fm.estado_actual,
          fm.fk_circuito_establecimiento_direccion,
          fm.fk_circuito_nro,
          presidente.nombre_completo as presidente_nombre,
          secretario.nombre_completo as secretario_nombre,
          vocal.nombre_completo as vocal_nombre
        FROM FormulaMesa fm
        LEFT JOIN IntegranteMesa imp ON fm.fk_presidente_credencial = imp.fk_usuariosistema_nro_credencial
        LEFT JOIN Ciudadano presidente ON imp.fk_usuariosistema_nro_credencial = presidente.nro_credencial
        LEFT JOIN IntegranteMesa ims ON fm.fk_secretario_credencial = ims.fk_usuariosistema_nro_credencial
        LEFT JOIN Ciudadano secretario ON ims.fk_usuariosistema_nro_credencial = secretario.nro_credencial
        LEFT JOIN IntegranteMesa imv ON fm.fk_vocal_credencial = imv.fk_usuariosistema_nro_credencial
        LEFT JOIN Ciudadano vocal ON imv.fk_usuariosistema_nro_credencial = vocal.nro_credencial
        WHERE fm.fk_eleccion_id = ? AND fm.nro_mesa = ?
      `;
      const results = await executeQuery(query, [electionId, mesaNumber]);
      return results[0] || null;
    } catch (error) {
      mysqlLogger.error('Error getting mesa info:', error);
      throw error;
    }
  }

  static async isMesaAbierta(electionId, mesaNumber) {
    try {
      const query = `
        SELECT COUNT(*) as is_open
        FROM FormulaMesa fm
        WHERE fm.fk_eleccion_id = ?
        AND fm.nro_mesa = ? AND fm.estado_actual = 'Abierto'
      `;
      const results = await executeQuery(query, [electionId, mesaNumber]);
      return results[0].is_open > 0;
    } catch (error) {
      mysqlLogger.error('Error checking if mesa is open:', error);
      throw error;
    }
  }

  static async cerrarMesa(electionId, mesaNumber, presidentCredencial) {
    try {
      const query = `
        INSERT INTO FormulaMesa_EstadoCircuito (
          fk_formulam_eleccion_id,
          fk_formulam_nro_mesa,
          fk_estadocircuito_tipo,
          fecha_hora
        ) VALUES (?, ?, 'Cerrado', NOW())
      `;
      await executeQuery(query, [electionId, mesaNumber]);
      return true;
    } catch (error) {
      mysqlLogger.error('Error closing mesa:', error);
      throw error;
    }
  }

  static async abrirMesa(electionId, mesaNumber, presidentCredencial) {
    try {
      const query = `
        INSERT INTO FormulaMesa_EstadoCircuito (
          fk_formulam_eleccion_id,
          fk_formulam_nro_mesa,
          fk_estadocircuito_tipo,
          fecha_hora
        ) VALUES (?, ?, 'Abierto', NOW())
      `;
      await executeQuery(query, [electionId, mesaNumber]);
      return true;
    } catch (error) {
      mysqlLogger.error('Error opening mesa:', error);
      throw error;
    }
  }

  static async getEstadoActualMesa(electionId, mesaNumber) {
    try {
      const query = `
        SELECT fmec.fk_estadocircuito_tipo as estado
        FROM FormulaMesa_EstadoCircuito fmec
        WHERE fmec.fk_formulam_eleccion_id = ?
        AND fmec.fk_formulam_nro_mesa = ?
        AND fmec.fecha_hora = (
          SELECT MAX(fecha_hora)
          FROM FormulaMesa_EstadoCircuito
          WHERE fk_formulam_eleccion_id = ?
          AND fk_formulam_nro_mesa = ?
        )
      `;
      const results = await executeQuery(query, [electionId, mesaNumber, electionId, mesaNumber]);
      return results[0] ? results[0].estado : null;
    } catch (error) {
      mysqlLogger.error('Error getting mesa current status:', error);
      throw error;
    }
  }

  static async getMesaPorCircuitoYEleccion(circuitoDireccion, circuitoNumero, eleccionId) {
    try {
      const query = `
        SELECT fm.nro_mesa
        FROM FormulaMesa fm
        WHERE fm.fk_circuito_establecimiento_direccion = ?
        AND fm.fk_circuito_nro = ?
        AND fm.fk_eleccion_id = ?
      `;
      const results = await executeQuery(query, [circuitoDireccion, circuitoNumero, eleccionId]);
      return results[0] || null;
    } catch (error) {
      mysqlLogger.error('Error getting mesa by circuit and election:', error);
      throw error;
    }
  }

  static async getCircuitosPorDepartamento(departmentId) {
    try {
      const query = `
        SELECT
          c.fk_establecimiento_direccion,
          c.nro,
          c.es_accesible,
          e.direccion as establecimiento_direccion,
          e.barrio,
          e.pueblo,
          e.ciudad_paraje,
          e.zona,
          e.tipo as establecimiento_tipo,
          d.nombre as departamento_nombre
        FROM Circuito c
        JOIN Establecimiento e ON c.fk_establecimiento_direccion = e.direccion
        JOIN Departamento d ON e.fk_departamento_id = d.id
        WHERE d.id = ?
        ORDER BY e.direccion, c.nro
      `;
      return await executeQuery(query, [departmentId]);
    } catch (error) {
      mysqlLogger.error('Error listando circuitos por departamento:', error);
      throw error;
    }
  }

  static async getTodosCircuitos() {
    try {
      const query = `
        SELECT
          c.fk_establecimiento_direccion,
          c.nro,
          c.es_accesible,
          e.direccion as establecimiento_direccion,
          e.barrio,
          e.pueblo,
          e.ciudad_paraje,
          e.zona,
          e.tipo as establecimiento_tipo,
          d.nombre as departamento_nombre
        FROM Circuito c
        JOIN Establecimiento e ON c.fk_establecimiento_direccion = e.direccion
        JOIN Departamento d ON e.fk_departamento_id = d.id
        ORDER BY d.nombre, e.direccion, c.nro
      `;
      return await executeQuery(query);
    } catch (error) {
      mysqlLogger.error('Error levantando todos los circuitos:', error);
      throw error;
    }
  }

  static async getHistorialEstadoMesa(electionId, mesaNumber) {
    try {
      const query = `
        SELECT
          fmec.fk_estadocircuito_tipo as estado,
          fmec.fecha_hora,
          ec.descripcion
        FROM FormulaMesa_EstadoCircuito fmec
        JOIN EstadoCircuito ec ON fmec.fk_estadocircuito_tipo = ec.tipo
        WHERE fmec.fk_formulam_eleccion_id = ?
        AND fmec.fk_formulam_nro_mesa = ?
        ORDER BY fmec.fecha_hora DESC
      `;
      return await executeQuery(query, [electionId, mesaNumber]);
    } catch (error) {
      mysqlLogger.error('Error levantando historial de estado de mesa:', error);
      throw error;
    }
  }

  static async getCircutoPorCredencial(credencial) {
    try {
      const query = `
        SELECT c.fk_circuito_establecimiento_direccion as direccion,
               c.fk_circuito_nro as numero
        FROM Ciudadano_Circuito_Eleccion c
        JOIN Ciudadano ci ON c.fk_ciudadano_nro_credencial = ci.nro_credencial
        WHERE ci.nro_credencial = ?
      `;
      const results = await executeQuery(query, [credencial]);
      return results[0] || null;
    } catch (error) {
      mysqlLogger.error('Error trayendo circuito por credencial:', error);
      throw error;
    }
  }

  static async getNroCircuitoDeTotem(ip) {
    try {
      const query = `
        SELECT fk_establecimiento_direccion as direccion,
               nro as numero
        FROM Circuito c
        WHERE c.ip_totem = ?
      `;
      const results = await executeQuery(query, [ip]);
      return results[0] || null;
    } catch (error) {
      mysqlLogger.error('Error trayendo número de circuito por IP de tótem:', error);
      throw error;
    }
  }
}

module.exports = CircuitosModel;
