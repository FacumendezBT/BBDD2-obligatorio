const { pool } = require('../config/database');
const { appLogger } = require('../config/logger');

class ReportesModel {
  static async getResultadosPorListaEnCircuito(direccion, numero, eleccionId) {
    try {
      const query = `
        SELECT 
          l.nro_lista,
          p.nombre as nombre_partido,
          COUNT(vp.fk_voto_id) as cantidad_votos,
          ROUND(
            (COUNT(vp.fk_voto_id) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               WHERE v2.fk_circuito_establecimiento_direccion = ? 
               AND v2.fk_circuito_nro = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Lista l
        INNER JOIN Partido p ON l.fk_partido_id = p.id
        INNER JOIN Papeleta pap ON l.fk_papeleta_id = pap.id
        INNER JOIN Voto_Papeleta vp ON pap.id = vp.fk_papeleta_id
        INNER JOIN Voto v ON vp.fk_voto_id = v.id
        WHERE v.fk_circuito_establecimiento_direccion = ?
        AND v.fk_circuito_nro = ?
        AND v.estado_actual = 'Contado'
        AND pap.fk_eleccion_id = ?
        GROUP BY l.nro_lista, p.nombre
        
        UNION ALL
        
        SELECT 
          'En Blanco' as nro_lista,
          'En Blanco' as nombre_partido,
          COUNT(*) as cantidad_votos,
          ROUND(
            (COUNT(*) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               WHERE v2.fk_circuito_establecimiento_direccion = ? 
               AND v2.fk_circuito_nro = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Voto v
        WHERE v.fk_circuito_establecimiento_direccion = ?
        AND v.fk_circuito_nro = ?
        AND v.tipo = 'Blanco'
        AND v.estado_actual = 'Contado'
        
        UNION ALL
        
        SELECT 
          'Anulado' as nro_lista,
          'Anulado' as nombre_partido,
          COUNT(*) as cantidad_votos,
          ROUND(
            (COUNT(*) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               WHERE v2.fk_circuito_establecimiento_direccion = ? 
               AND v2.fk_circuito_nro = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Voto v
        WHERE v.fk_circuito_establecimiento_direccion = ?
        AND v.fk_circuito_nro = ?
        AND v.tipo = 'Anulado'
        AND v.estado_actual = 'Contado'
        
        ORDER BY cantidad_votos DESC
      `;

      const [rows] = await pool.execute(query, [
        direccion,
        numero,
        eleccionId, // Para el cálculo del porcentaje en el primer SELECT
        direccion,
        numero,
        eleccionId, // Para el primer SELECT
        direccion,
        numero,
        eleccionId, // Para el cálculo del porcentaje en el segundo SELECT
        direccion,
        numero, // Para el segundo SELECT
        direccion,
        numero,
        eleccionId, // Para el cálculo del porcentaje en el tercer SELECT
        direccion,
        numero, // Para el tercer SELECT
      ]);

      return rows;
    } catch (error) {
      appLogger.error('Error al obtener resultados por lista en circuito', {
        error: error.message,
        direccion,
        numero,
        eleccionId,
      });
      throw error;
    }
  }

  static async getResultadosAgregadosPorPartidoEnCircuito(direccion, numero, eleccionId) {
    try {
      const query = `
        SELECT 
          p.nombre as nombre_partido,
          COUNT(vp.fk_voto_id) as cantidad_votos,
          ROUND(
            (COUNT(vp.fk_voto_id) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               WHERE v2.fk_circuito_establecimiento_direccion = ? 
               AND v2.fk_circuito_nro = ?
               AND v2.estado_actual = 'Contado'
               AND v2.tipo IN ('Normal', 'Observado')
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Partido p
        INNER JOIN Lista l ON p.id = l.fk_partido_id
        INNER JOIN Papeleta pap ON l.fk_papeleta_id = pap.id
        INNER JOIN Voto_Papeleta vp ON pap.id = vp.fk_papeleta_id
        INNER JOIN Voto v ON vp.fk_voto_id = v.id
        WHERE v.fk_circuito_establecimiento_direccion = ?
        AND v.fk_circuito_nro = ?
        AND v.estado_actual = 'Contado'
        AND v.tipo IN ('Normal', 'Observado')
        AND pap.fk_eleccion_id = ?
        GROUP BY p.nombre
        
        UNION ALL
        
        SELECT 
          'En Blanco' as nombre_partido,
          COUNT(*) as cantidad_votos,
          ROUND(
            (COUNT(*) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               WHERE v2.fk_circuito_establecimiento_direccion = ? 
               AND v2.fk_circuito_nro = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Voto v
        WHERE v.fk_circuito_establecimiento_direccion = ?
        AND v.fk_circuito_nro = ?
        AND v.tipo = 'Blanco'
        AND v.estado_actual = 'Contado'
        
        UNION ALL
        
        SELECT 
          'Anulado' as nombre_partido,
          COUNT(*) as cantidad_votos,
          ROUND(
            (COUNT(*) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               WHERE v2.fk_circuito_establecimiento_direccion = ? 
               AND v2.fk_circuito_nro = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Voto v
        WHERE v.fk_circuito_establecimiento_direccion = ?
        AND v.fk_circuito_nro = ?
        AND v.tipo = 'Anulado'
        AND v.estado_actual = 'Contado'
        
        ORDER BY cantidad_votos DESC
      `;

      const [rows] = await pool.execute(query, [
        direccion,
        numero,
        eleccionId, // Para el cálculo del porcentaje en el primer SELECT
        direccion,
        numero,
        eleccionId, // Para el primer SELECT
        direccion,
        numero,
        eleccionId, // Para el cálculo del porcentaje en el segundo SELECT
        direccion,
        numero, // Para el segundo SELECT
        direccion,
        numero,
        eleccionId, // Para el cálculo del porcentaje en el tercer SELECT
        direccion,
        numero, // Para el tercer SELECT
      ]);

      return rows;
    } catch (error) {
      appLogger.error('Error al obtener resultados agregados por partido en circuito', {
        error: error.message,
        direccion,
        numero,
        eleccionId,
      });
      throw error;
    }
  }

  static async getResultadosPorCandidatoEnCircuito(direccion, numero, eleccionId) {
    try {
      const query = `
        SELECT 
          p.nombre as nombre_partido,
          c.nombre_completo as nombre_candidato,
          COUNT(vp.fk_voto_id) as cantidad_votos,
          ROUND(
            (COUNT(vp.fk_voto_id) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               WHERE v2.fk_circuito_establecimiento_direccion = ? 
               AND v2.fk_circuito_nro = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Partido p
        INNER JOIN Lista l ON p.id = l.fk_partido_id
        INNER JOIN Candidato cand ON l.fk_candidato_credencial = cand.fk_ciudadano_nro_credencial
        INNER JOIN Ciudadano c ON cand.fk_ciudadano_nro_credencial = c.nro_credencial
        INNER JOIN Papeleta pap ON l.fk_papeleta_id = pap.id
        INNER JOIN Voto_Papeleta vp ON pap.id = vp.fk_papeleta_id
        INNER JOIN Voto v ON vp.fk_voto_id = v.id
        WHERE v.fk_circuito_establecimiento_direccion = ?
        AND v.fk_circuito_nro = ?
        AND v.estado_actual = 'Contado'
        AND pap.fk_eleccion_id = ?
        GROUP BY p.nombre, c.nombre_completo
        
        UNION ALL
        
        SELECT 
          'En Blanco' as nombre_partido,
          'En Blanco' as nombre_candidato,
          COUNT(*) as cantidad_votos,
          ROUND(
            (COUNT(*) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               WHERE v2.fk_circuito_establecimiento_direccion = ? 
               AND v2.fk_circuito_nro = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Voto v
        WHERE v.fk_circuito_establecimiento_direccion = ?
        AND v.fk_circuito_nro = ?
        AND v.tipo = 'Blanco'
        AND v.estado_actual = 'Contado'
        
        UNION ALL
        
        SELECT 
          'Anulado' as nombre_partido,
          'Anulado' as nombre_candidato,
          COUNT(*) as cantidad_votos,
          ROUND(
            (COUNT(*) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               WHERE v2.fk_circuito_establecimiento_direccion = ? 
               AND v2.fk_circuito_nro = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Voto v
        WHERE v.fk_circuito_establecimiento_direccion = ?
        AND v.fk_circuito_nro = ?
        AND v.tipo = 'Anulado'
        AND v.estado_actual = 'Contado'
        
        ORDER BY cantidad_votos DESC
      `;

      const [rows] = await pool.execute(query, [
        direccion,
        numero,
        eleccionId, // Para el cálculo del porcentaje en el primer SELECT
        direccion,
        numero,
        eleccionId, // Para el primer SELECT
        direccion,
        numero,
        eleccionId, // Para el cálculo del porcentaje en el segundo SELECT
        direccion,
        numero, // Para el segundo SELECT
        direccion,
        numero,
        eleccionId, // Para el cálculo del porcentaje en el tercer SELECT
        direccion,
        numero, // Para el tercer SELECT
      ]);

      return rows;
    } catch (error) {
      appLogger.error('Error al obtener resultados por candidato en circuito', {
        error: error.message,
        direccion,
        numero,
        eleccionId,
      });
      throw error;
    }
  }

  static async getResultadosPorPartidoEnDepartamento(departamentoId, eleccionId) {
    try {
      const query = `
        SELECT 
          p.nombre as nombre_partido,
          COUNT(vp.fk_voto_id) as cantidad_votos,
          ROUND(
            (COUNT(vp.fk_voto_id) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               INNER JOIN Circuito c2 ON v2.fk_circuito_establecimiento_direccion = c2.fk_establecimiento_direccion 
               AND v2.fk_circuito_nro = c2.nro
               INNER JOIN Establecimiento e2 ON c2.fk_establecimiento_direccion = e2.direccion
               WHERE e2.fk_departamento_id = ?
               AND v2.estado_actual = 'Contado'
               AND v2.tipo IN ('Normal', 'Observado')
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Partido p
        INNER JOIN Lista l ON p.id = l.fk_partido_id
        INNER JOIN Papeleta pap ON l.fk_papeleta_id = pap.id
        INNER JOIN Voto_Papeleta vp ON pap.id = vp.fk_papeleta_id
        INNER JOIN Voto v ON vp.fk_voto_id = v.id
        INNER JOIN Circuito c ON v.fk_circuito_establecimiento_direccion = c.fk_establecimiento_direccion 
        AND v.fk_circuito_nro = c.nro
        INNER JOIN Establecimiento e ON c.fk_establecimiento_direccion = e.direccion
        WHERE e.fk_departamento_id = ?
        AND v.estado_actual = 'Contado'
        AND v.tipo IN ('Normal', 'Observado')
        AND pap.fk_eleccion_id = ?
        GROUP BY p.nombre
        
        UNION ALL
        
        SELECT 
          'En Blanco' as nombre_partido,
          COUNT(*) as cantidad_votos,
          ROUND(
            (COUNT(*) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               INNER JOIN Circuito c2 ON v2.fk_circuito_establecimiento_direccion = c2.fk_establecimiento_direccion 
               AND v2.fk_circuito_nro = c2.nro
               INNER JOIN Establecimiento e2 ON c2.fk_establecimiento_direccion = e2.direccion
               WHERE e2.fk_departamento_id = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Voto v
        INNER JOIN Circuito c ON v.fk_circuito_establecimiento_direccion = c.fk_establecimiento_direccion 
        AND v.fk_circuito_nro = c.nro
        INNER JOIN Establecimiento e ON c.fk_establecimiento_direccion = e.direccion
        WHERE e.fk_departamento_id = ?
        AND v.tipo = 'Blanco'
        AND v.estado_actual = 'Contado'
        
        UNION ALL
        
        SELECT 
          'Anulado' as nombre_partido,
          COUNT(*) as cantidad_votos,
          ROUND(
            (COUNT(*) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               INNER JOIN Circuito c2 ON v2.fk_circuito_establecimiento_direccion = c2.fk_establecimiento_direccion 
               AND v2.fk_circuito_nro = c2.nro
               INNER JOIN Establecimiento e2 ON c2.fk_establecimiento_direccion = e2.direccion
               WHERE e2.fk_departamento_id = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Voto v
        INNER JOIN Circuito c ON v.fk_circuito_establecimiento_direccion = c.fk_establecimiento_direccion 
        AND v.fk_circuito_nro = c.nro
        INNER JOIN Establecimiento e ON c.fk_establecimiento_direccion = e.direccion
        WHERE e.fk_departamento_id = ?
        AND v.tipo = 'Anulado'
        AND v.estado_actual = 'Contado'
        
        ORDER BY cantidad_votos DESC
      `;

      const [rows] = await pool.execute(query, [
        departamentoId,
        eleccionId, // Para el cálculo del porcentaje en el primer SELECT
        departamentoId,
        eleccionId, // Para el primer SELECT
        departamentoId,
        eleccionId, // Para el cálculo del porcentaje en el segundo SELECT
        departamentoId, // Para el segundo SELECT
        departamentoId,
        eleccionId, // Para el cálculo del porcentaje en el tercer SELECT
        departamentoId, // Para el tercer SELECT
      ]);

      return rows;
    } catch (error) {
      appLogger.error('Error al obtener resultados por partido en departamento', {
        error: error.message,
        departamentoId,
        eleccionId,
      });
      throw error;
    }
  }

  static async getResultadosPorCandidatoEnDepartamento(departamentoId, eleccionId) {
    try {
      const query = `
        SELECT 
          p.nombre as nombre_partido,
          c.nombre_completo as nombre_candidato,
          COUNT(vp.fk_voto_id) as cantidad_votos,
          ROUND(
            (COUNT(vp.fk_voto_id) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               INNER JOIN Circuito c2 ON v2.fk_circuito_establecimiento_direccion = c2.fk_establecimiento_direccion 
               AND v2.fk_circuito_nro = c2.nro
               INNER JOIN Establecimiento e2 ON c2.fk_establecimiento_direccion = e2.direccion
               WHERE e2.fk_departamento_id = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Partido p
        INNER JOIN Lista l ON p.id = l.fk_partido_id
        INNER JOIN Candidato cand ON l.fk_candidato_credencial = cand.fk_ciudadano_nro_credencial
        INNER JOIN Ciudadano c ON cand.fk_ciudadano_nro_credencial = c.nro_credencial
        INNER JOIN Papeleta pap ON l.fk_papeleta_id = pap.id
        INNER JOIN Voto_Papeleta vp ON pap.id = vp.fk_papeleta_id
        INNER JOIN Voto v ON vp.fk_voto_id = v.id
        INNER JOIN Circuito circ ON v.fk_circuito_establecimiento_direccion = circ.fk_establecimiento_direccion 
        AND v.fk_circuito_nro = circ.nro
        INNER JOIN Establecimiento e ON circ.fk_establecimiento_direccion = e.direccion
        WHERE e.fk_departamento_id = ?
        AND v.estado_actual = 'Contado'
        AND pap.fk_eleccion_id = ?
        GROUP BY p.nombre, c.nombre_completo
        
        UNION ALL
        
        SELECT 
          'En Blanco' as nombre_partido,
          'En Blanco' as nombre_candidato,
          COUNT(*) as cantidad_votos,
          ROUND(
            (COUNT(*) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               INNER JOIN Circuito c2 ON v2.fk_circuito_establecimiento_direccion = c2.fk_establecimiento_direccion 
               AND v2.fk_circuito_nro = c2.nro
               INNER JOIN Establecimiento e2 ON c2.fk_establecimiento_direccion = e2.direccion
               WHERE e2.fk_departamento_id = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Voto v
        INNER JOIN Circuito c ON v.fk_circuito_establecimiento_direccion = c.fk_establecimiento_direccion 
        AND v.fk_circuito_nro = c.nro
        INNER JOIN Establecimiento e ON c.fk_establecimiento_direccion = e.direccion
        WHERE e.fk_departamento_id = ?
        AND v.tipo = 'Blanco'
        AND v.estado_actual = 'Contado'
        
        UNION ALL
        
        SELECT 
          'Anulado' as nombre_partido,
          'Anulado' as nombre_candidato,
          COUNT(*) as cantidad_votos,
          ROUND(
            (COUNT(*) * 100.0 / 
              (SELECT COUNT(*) 
               FROM Voto v2 
               INNER JOIN Circuito c2 ON v2.fk_circuito_establecimiento_direccion = c2.fk_establecimiento_direccion 
               AND v2.fk_circuito_nro = c2.nro
               INNER JOIN Establecimiento e2 ON c2.fk_establecimiento_direccion = e2.direccion
               WHERE e2.fk_departamento_id = ?
               AND v2.estado_actual = 'Contado'
               AND EXISTS (
                 SELECT 1 FROM Voto_Papeleta vp2 
                 INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id 
                 WHERE vp2.fk_voto_id = v2.id 
                 AND pap2.fk_eleccion_id = ?
               )
              )
            ), 2
          ) as porcentaje
        FROM Voto v
        INNER JOIN Circuito c ON v.fk_circuito_establecimiento_direccion = c.fk_establecimiento_direccion 
        AND v.fk_circuito_nro = c.nro
        INNER JOIN Establecimiento e ON c.fk_establecimiento_direccion = e.direccion
        WHERE e.fk_departamento_id = ?
        AND v.tipo = 'Anulado'
        AND v.estado_actual = 'Contado'
        
        ORDER BY cantidad_votos DESC
      `;

      const [rows] = await pool.execute(query, [
        departamentoId,
        eleccionId, // Para el cálculo del porcentaje en el primer SELECT
        departamentoId,
        eleccionId, // Para el primer SELECT
        departamentoId,
        eleccionId, // Para el cálculo del porcentaje en el segundo SELECT
        departamentoId, // Para el segundo SELECT
        departamentoId,
        eleccionId, // Para el cálculo del porcentaje en el tercer SELECT
        departamentoId, // Para el tercer SELECT
      ]);

      return rows;
    } catch (error) {
      appLogger.error('Error al obtener resultados por candidato en departamento', {
        error: error.message,
        departamentoId,
        eleccionId,
      });
      throw error;
    }
  }

  static async getCandidatosGanadoresPorDepartamento(eleccionId) {
    try {
      const query = `
        SELECT 
          d.nombre as nombre_departamento,
          p.nombre as nombre_partido,
          c.nombre_completo as nombre_candidato,
          COUNT(vp.fk_voto_id) as cantidad_votos
        FROM Departamento d
        INNER JOIN Establecimiento e ON d.id = e.fk_departamento_id
        INNER JOIN Circuito circ ON e.direccion = circ.fk_establecimiento_direccion
        INNER JOIN Voto v ON circ.fk_establecimiento_direccion = v.fk_circuito_establecimiento_direccion 
        AND circ.nro = v.fk_circuito_nro
        INNER JOIN Voto_Papeleta vp ON v.id = vp.fk_voto_id
        INNER JOIN Papeleta pap ON vp.fk_papeleta_id = pap.id
        INNER JOIN Lista l ON pap.id = l.fk_papeleta_id
        INNER JOIN Partido p ON l.fk_partido_id = p.id
        INNER JOIN Candidato cand ON l.fk_candidato_credencial = cand.fk_ciudadano_nro_credencial
        INNER JOIN Ciudadano c ON cand.fk_ciudadano_nro_credencial = c.nro_credencial
        WHERE v.estado_actual = 'Contado'
        AND v.tipo IN ('Normal', 'Observado')
        AND pap.fk_eleccion_id = ?
        GROUP BY d.id, d.nombre, p.nombre, c.nombre_completo
        HAVING COUNT(vp.fk_voto_id) = (
          SELECT MAX(votos_por_candidato.cantidad_votos)
          FROM (
            SELECT COUNT(vp2.fk_voto_id) as cantidad_votos
            FROM Establecimiento e2
            INNER JOIN Circuito circ2 ON e2.direccion = circ2.fk_establecimiento_direccion
            INNER JOIN Voto v2 ON circ2.fk_establecimiento_direccion = v2.fk_circuito_establecimiento_direccion 
            AND circ2.nro = v2.fk_circuito_nro
            INNER JOIN Voto_Papeleta vp2 ON v2.id = vp2.fk_voto_id
            INNER JOIN Papeleta pap2 ON vp2.fk_papeleta_id = pap2.id
            INNER JOIN Lista l2 ON pap2.id = l2.fk_papeleta_id
            INNER JOIN Candidato cand2 ON l2.fk_candidato_credencial = cand2.fk_ciudadano_nro_credencial
            WHERE e2.fk_departamento_id = d.id
            AND v2.estado_actual = 'Contado'
            AND v2.tipo IN ('Normal', 'Observado')
            AND pap2.fk_eleccion_id = ?
            GROUP BY cand2.fk_ciudadano_nro_credencial
          ) as votos_por_candidato
        )
        ORDER BY d.nombre
      `;

      const [rows] = await pool.execute(query, [eleccionId, eleccionId]);
      return rows;
    } catch (error) {
      appLogger.error('Error al obtener candidatos ganadores por departamento', {
        error: error.message,
        eleccionId,
      });
      throw error;
    }
  }
}

module.exports = ReportesModel;
