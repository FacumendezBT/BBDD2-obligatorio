const { executeQuery, executeTransaction } = require('../config/database');
const { mysqlLogger } = require('../config/logger');
const crypto = require('crypto');

class VotosModel {
    static async enviarVoto(votoData) {
        try {
            const {
                ciudadano_credencial,
                circuito_direccion,
                circuito_numero,
                eleccion_id,
                mesa_numero,
                papeletas = [],
                tipo = 'Normal',
                hora_emision = new Date()
            } = votoData;

            const hash_integridad = VotosModel.generarHashIntegridad();
            const id_generado = VotosModel.generarIdUnico();

            const estado_inicial = tipo === 'Observado' ? 'Emitido Observado' : 'Emitido';

            const queries = [
                {
                    query: `
            INSERT INTO Voto (
              hora_emision, 
              hash_integridad, 
              estado_actual, 
              tipo, 
              fk_circuito_establecimiento_direccion, 
              fk_circuito_nro
            ) VALUES (?, ?, ?, ?, ?, ?)
          `,
                    params: [
                        hora_emision,
                        hash_integridad,
                        estado_inicial,
                        tipo,
                        circuito_direccion,
                        circuito_numero
                    ]
                },
                // Insertar en tabla Vota
                {
                    query: `
            INSERT INTO Vota (
              fk_formulam_eleccion_id, 
              fk_formulam_nro_mesa, 
              fk_ciudadano_nro_credencial, 
              id_generado, 
              fecha_hora
            ) VALUES (?, ?, ?, ?, ?)
          `,
                    params: [
                        eleccion_id,
                        mesa_numero,
                        ciudadano_credencial,
                        id_generado,
                        hora_emision
                    ]
                }
            ];

            // Ejecutar transacción
            const results = await executeTransaction(queries);
            const votoId = results[0].insertId;

            // Si hay papeletas, asociarlas al voto
            if (papeletas.length > 0) {
                const papeletasQueries = papeletas.map(papeletaId => ({
                    query: `INSERT INTO Voto_Papeleta (fk_voto_id, fk_papeleta_id) VALUES (?, ?)`,
                    params: [votoId, papeletaId]
                }));

                await executeTransaction(papeletasQueries);
            }

            // Si es un voto observado, crear registro en tabla Observado
            if (tipo === 'Observado') {
                const observadoQuery = {
                    query: `INSERT INTO Observado (fk_voto_id) VALUES (?)`,
                    params: [votoId]
                };
                await executeTransaction([observadoQuery]);
            }

            return {
                votoId,
                hash_integridad,
                id_generado,
                estado: estado_inicial
            };
        } catch (error) {
            mysqlLogger.error('Error enviando voto:', error);
            throw error;
        }
    }

    static async validarVoto(votoData) {
        try {
            const { ciudadano_credencial, eleccion_id, circuito_direccion, circuito_numero } = votoData;

            const yaVoto = await VotosModel.verificarYaVoto(ciudadano_credencial, eleccion_id);
            if (yaVoto) {
                return { valido: false, mensaje: 'El ciudadano ya ha votado en esta elección' };
            }

            const eleccionActiva = await VotosModel.verificarEleccionActiva(eleccion_id);
            if (!eleccionActiva) {
                return { valido: false, mensaje: 'La elección no está activa' };
            }

            const circuitoValido = await VotosModel.verificarCircuitoCiudadano(ciudadano_credencial, eleccion_id, circuito_direccion, circuito_numero);
            if (!circuitoValido) {
                return { valido: false, mensaje: 'El circuito no corresponde al ciudadano' };
            }

            return { valido: true, mensaje: 'Voto válido' };
        } catch (error) {
            mysqlLogger.error('Error validando voto:', error);
            throw error;
        }
    }

    static async obtenerEstadoVotacion(idEleccion) {
        try {
            const query = `
        SELECT 
          e.id,
          e.nombre,
          e.fecha_hora_inicio,
          e.fecha_hora_fin,
          e.tipo,
          COUNT(v.id) as total_votos,
          COUNT(CASE WHEN v.estado_actual = 'Emitido' THEN 1 END) as votos_emitidos,
          COUNT(CASE WHEN v.estado_actual = 'Emitido Observado' THEN 1 END) as votos_observados,
          COUNT(CASE WHEN v.estado_actual = 'Contado' THEN 1 END) as votos_contados,
          COUNT(CASE WHEN v.tipo = 'Blanco' THEN 1 END) as votos_blancos
        FROM Eleccion e
        LEFT JOIN FormulaMesa fm ON e.id = fm.fk_eleccion_id
        LEFT JOIN Voto v ON v.fk_circuito_establecimiento_direccion = fm.fk_circuito_establecimiento_direccion 
                            AND v.fk_circuito_nro = fm.fk_circuito_nro
        WHERE e.id = ?
        GROUP BY e.id, e.nombre, e.fecha_hora_inicio, e.fecha_hora_fin, e.tipo
      `;

            const result = await executeQuery(query, [idEleccion]);
            return result[0] || null;
        } catch (error) {
            mysqlLogger.error('Error obteniendo estado de votación:', error);
            throw error;
        }
    }

  static async aprobarVoto(idVoto, credencialIntegrante) {
    try {
      // Verificar que el voto existe y está en estado observado
      const voto = await executeQuery(
        'SELECT estado_actual FROM Voto WHERE id = ?',
        [idVoto]
      );

      if (!voto || voto.length === 0) {
        throw new Error('Voto no encontrado');
      }

      if (voto[0].estado_actual !== 'Emitido Observado') {
        throw new Error('El voto no está en estado observado');
      }

      const queries = [
        {
          query: `UPDATE Voto SET estado_actual = 'Aprobado Presidente Mesa' WHERE id = ?`,
          params: [idVoto]
        },
        {
          query: `
            UPDATE Observado 
            SET hora_aprobado = NOW(), fk_integrantemesa_nro_credencial = ? 
            WHERE fk_voto_id = ?
          `,
          params: [credencialIntegrante, idVoto]
        }
      ];

      await executeTransaction(queries);
      return { mensaje: 'Voto aprobado exitosamente' };
    } catch (error) {
      mysqlLogger.error('Error aprobando voto:', error);
      throw error;
    }
  }

    static async obtenerVotosPorCircuito(direccionCircuito, numeroCircuito) {
        try {
            const query = `
        SELECT 
          v.id,
          v.hora_emision,
          v.hora_contado,
          v.estado_actual,
          v.tipo,
          v.hash_integridad,
          vt.id_generado,
          vt.fecha_hora as fecha_voto,
          c.nombre_completo as ciudadano_nombre,
          GROUP_CONCAT(p.descripcion) as papeletas
        FROM Voto v
        LEFT JOIN FormulaMesa fm ON v.fk_circuito_establecimiento_direccion = fm.fk_circuito_establecimiento_direccion 
                                  AND v.fk_circuito_nro = fm.fk_circuito_nro
        LEFT JOIN Vota vt ON fm.fk_eleccion_id = vt.fk_formulam_eleccion_id 
                           AND fm.nro_mesa = vt.fk_formulam_nro_mesa
        LEFT JOIN Ciudadano c ON vt.fk_ciudadano_nro_credencial = c.nro_credencial
        LEFT JOIN Voto_Papeleta vp ON v.id = vp.fk_voto_id
        LEFT JOIN Papeleta p ON vp.fk_papeleta_id = p.id
        WHERE v.fk_circuito_establecimiento_direccion = ? 
          AND v.fk_circuito_nro = ?
        GROUP BY v.id, v.hora_emision, v.hora_contado, v.estado_actual, v.tipo, 
                 v.hash_integridad, vt.id_generado, vt.fecha_hora, c.nombre_completo
        ORDER BY v.hora_emision DESC
      `;

            const results = await executeQuery(query, [direccionCircuito, numeroCircuito]);
            return results;
        } catch (error) {
            mysqlLogger.error('Error obteniendo votos por circuito:', error);
            throw error;
        }
    }

    static async verificarYaVoto(credencial, eleccionId) {
        try {
            const query = `
        SELECT COUNT(*) as count 
        FROM Vota 
        WHERE fk_ciudadano_nro_credencial = ? AND fk_formulam_eleccion_id = ?
      `;
            const result = await executeQuery(query, [credencial, eleccionId]);
            return result[0].count > 0;
        } catch (error) {
            mysqlLogger.error('Error verificando si ya votó:', error);
            throw error;
        }
    }

    static async verificarEleccionActiva(eleccionId) {
        try {
            const query = `
        SELECT COUNT(*) as count 
        FROM Eleccion 
        WHERE id = ? AND NOW() BETWEEN fecha_hora_inicio AND fecha_hora_fin
      `;
            const result = await executeQuery(query, [eleccionId]);
            return result[0].count > 0;
        } catch (error) {
            mysqlLogger.error('Error verificando elección activa:', error);
            throw error;
        }
    }

    static async verificarCircuitoCiudadano(credencial, eleccionId, direccion, numero) {
        try {
            const query = `
        SELECT COUNT(*) as count 
        FROM Ciudadano_Circuito_Eleccion 
        WHERE fk_ciudadano_nro_credencial = ? 
          AND fk_eleccion_id = ? 
          AND fk_circuito_establecimiento_direccion = ? 
          AND fk_circuito_nro = ?
      `;
            const result = await executeQuery(query, [credencial, eleccionId, direccion, numero]);
            return result[0].count > 0;
        } catch (error) {
            mysqlLogger.error('Error verificando circuito del ciudadano:', error);
            throw error;
        }
    }

    static generarHashIntegridad() {
        return crypto.randomBytes(32).toString('hex');
    }

    static generarIdUnico() {
        return crypto.randomBytes(16).toString('hex') + '-' + Date.now();
    }
}

module.exports = VotosModel;
