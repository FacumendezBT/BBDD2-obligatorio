const { executeQuery } = require('../config/database');
const { mysqlLogger } = require('../config/logger');

class EleccionModel {
  static async getEleccionesHistoricas() {
    try {
      const query = `
                SELECT 
                    id,
                    fecha_hora_inicio,
                    fecha_hora_fin,
                    nombre,
                    tipo
                FROM Eleccion
                ORDER BY fecha_hora_inicio DESC
            `;

      return await executeQuery(query);
    } catch (error) {
      mysqlLogger.error('Error listando elecciones históricas:', error);
      throw error;
    }
  }

  static async getEleccionById(electionId) {
    try {
      const query = `
                SELECT 
                    id,
                    fecha_hora_inicio,
                    fecha_hora_fin,
                    nombre,
                    tipo
                FROM Eleccion
                WHERE id = ?
            `;

      const results = await executeQuery(query, [electionId]);
      return results[0] || null;
    } catch (error) {
      mysqlLogger.error('Error trayendo? elección por ID:', error);
      throw error;
    }
  }

  static async traerEleccionesActivas() {
    try {
      const query = `
                SELECT 
                    id,
                    fecha_hora_inicio,
                    fecha_hora_fin,
                    nombre,
                    tipo
                FROM Eleccion
                WHERE NOW() BETWEEN fecha_hora_inicio AND fecha_hora_fin
                ORDER BY fecha_hora_inicio
            `;

      return await executeQuery(query);
    } catch (error) {
      mysqlLogger.error('Error trayendo elecciones activas:', error);
      throw error;
    }
  }

  static async getFuturasElecciones() {
    try {
      const query = `
                SELECT 
                    id,
                    fecha_hora_inicio,
                    fecha_hora_fin,
                    nombre,
                    tipo
                FROM Eleccion
                WHERE fecha_hora_inicio > NOW()
                ORDER BY fecha_hora_inicio
            `;

      return await executeQuery(query);
    } catch (error) {
      mysqlLogger.error('Error obteniendo elecciones futuras:', error);
      throw error;
    }
  }

  static async getEleccionesPasadas() {
    try {
      const query = `
                SELECT 
                    id,
                    fecha_hora_inicio,
                    fecha_hora_fin,
                    nombre,
                    tipo
                FROM Eleccion
                WHERE fecha_hora_fin < NOW()
                ORDER BY fecha_hora_fin DESC
            `;

      return await executeQuery(query);
    } catch (error) {
      mysqlLogger.error('Error obteniendo elecciones pasadas:', error);
      throw error;
    }
  }

  static async isEleccionActiva(electionId) {
    try {
      const query = `
                SELECT COUNT(*) as active_count
                FROM Eleccion
                WHERE id = ? AND NOW() BETWEEN fecha_hora_inicio AND fecha_hora_fin
            `;

      const results = await executeQuery(query, [electionId]);
      return results[0].active_count > 0;
    } catch (error) {
      mysqlLogger.error('Error verificando si la elección está activa:', error);
      throw error;
    }
  }

  static async getListasEleccion(electionId) {
    try {
      const query = `
                SELECT 
                    l.nro_lista,
                    l.fk_partido_id,
                    l.fk_papeleta_id,
                    l.fk_departamento_id,
                    p.nombre as partido_nombre,
                    pap.descripcion as papeleta_descripcion,
                    d.nombre as departamento_nombre,
                    c.nombre_completo as candidato_nombre
                FROM Lista l
                JOIN Partido p ON l.fk_partido_id = p.id
                JOIN Papeleta pap ON l.fk_papeleta_id = pap.id
                LEFT JOIN Departamento d ON l.fk_departamento_id = d.id
                LEFT JOIN Candidato can ON l.fk_candidato_credencial = can.fk_ciudadano_nro_credencial
                LEFT JOIN Ciudadano c ON can.fk_ciudadano_nro_credencial = c.nro_credencial
                WHERE pap.fk_eleccion_id = ?
                ORDER BY p.nombre, l.nro_lista
            `;

      return await executeQuery(query, [electionId]);
    } catch (error) {
      mysqlLogger.error('Error obteniendo listas de la elección:', error);
      throw error;
    }
  }

  static async getPapeletasComunesEnEleccion(electionId) {
    try {
      const query = `
                SELECT 
                    p.id,
                    p.descripcion,
                    pc.es_si,
                    pc.color
                FROM Papeleta p
                JOIN PapeletaComun pc ON p.id = pc.fk_papeleta_id
                WHERE p.fk_eleccion_id = ?
                ORDER BY pc.es_si DESC
            `;

      return await executeQuery(query, [electionId]);
    } catch (error) {
      mysqlLogger.error('Error obteniendo papeletas comunes de la elección:', error);
      throw error;
    }
  }

  static async crearEleccion(electionData) {
    try {
      const query = `
                INSERT INTO Eleccion (fecha_hora_inicio, fecha_hora_fin, nombre, tipo)
                VALUES (?, ?, ?, ?)
            `;

      const result = await executeQuery(query, [
        electionData.fecha_hora_inicio,
        electionData.fecha_hora_fin,
        electionData.nombre,
        electionData.tipo,
      ]);

      return await this.getEleccionById(result.insertId);
    } catch (error) {
      mysqlLogger.error('Error creando elección:', error);
      throw error;
    }
  }
}

module.exports = EleccionModel;
