const { executeQuery, executeTransaction } = require('../config/database');
const { mysqlLogger } = require('../config/logger');
const crypto = require('crypto');
const CircuitosModel = require('./circuitos-model');

class VotosModel {
  static async enviarVoto(votoData) {
    try {
      const {
        ciudadano_credencial,
        circuito_direccion,
        circuito_numero,
        papeletas_por_eleccion,
        votos_blancos = [],
        tipo = 'Normal',
        hora_emision = new Date(),
      } = votoData;

      // Validar que tenemos al menos una elección (incluyendo votos en blanco)
      const totalElecciones = Object.keys(papeletas_por_eleccion || {}).length + (votos_blancos?.length || 0);
      if (totalElecciones === 0) {
        throw new Error('Debe haber al menos una elección para votar');
      }

      const eleccionesIds = Object.keys(papeletas_por_eleccion || {});
      const resultados = [];

      // Generar un ID único para toda la transacción de voto
      const transaccion_id = VotosModel.generarIdUnico();

      // Procesar cada elección con papeletas
      for (const eleccionId of eleccionesIds) {
        const papeletas = papeletas_por_eleccion[eleccionId];

        // Validar que el ciudadano puede votar en esta elección
        const validacion = await VotosModel.validarVotoParaEleccion({
          ciudadano_credencial,
          eleccion_id: parseInt(eleccionId),
          circuito_direccion,
          circuito_numero,
        });

        if (!validacion.valido) {
          throw new Error(`Elección ${eleccionId}: ${validacion.mensaje}`);
        }

        // Obtener el número de mesa para esta elección
        const mesa_numero = await VotosModel.getNroMesaPorCircuitoYEleccion(
          circuito_direccion,
          circuito_numero,
          parseInt(eleccionId)
        );

        const hash_integridad = VotosModel.generarHashIntegridad();
        const id_generado = `${transaccion_id}-${eleccionId}`;
        const estado_inicial = tipo === 'Observado' ? 'Emitido Observado' : 'Emitido';

        // Queries para esta elección específica
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
            params: [hora_emision, hash_integridad, estado_inicial, tipo, circuito_direccion, circuito_numero],
          },
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
            params: [parseInt(eleccionId), mesa_numero, ciudadano_credencial, id_generado, hora_emision],
          },
        ];

        // Ejecutar transacción para esta elección
        const results = await executeTransaction(queries);
        const votoId = results[0].insertId;

        // Asociar papeletas al voto
        if (papeletas && papeletas.length > 0) {
          const papeletasQueries = papeletas.map((papeleta) => {
            const papeletaId = typeof papeleta === 'object' ? papeleta.papeleta_id : papeleta;
            return {
              query: `INSERT INTO Voto_Papeleta (fk_voto_id, fk_papeleta_id) VALUES (?, ?)`,
              params: [votoId, papeletaId],
            };
          });

          await executeTransaction(papeletasQueries);
        }

        resultados.push({
          eleccion_id: parseInt(eleccionId),
          voto_id: votoId,
          tipo: 'Normal',
          transaccion_id: id_generado,
        });

        // Si es un voto observado, crear registro en tabla Observado
        if (tipo === 'Observado') {
          const observadoQuery = {
            query: `INSERT INTO Observado (fk_voto_id) VALUES (?)`,
            params: [votoId],
          };
          await executeTransaction([observadoQuery]);
        }
      }

      // Procesar votos en blanco
      for (const eleccionId of votos_blancos || []) {
        // Validar que el ciudadano puede votar en esta elección
        const validacion = await VotosModel.validarVotoParaEleccion({
          ciudadano_credencial,
          eleccion_id: parseInt(eleccionId),
          circuito_direccion,
          circuito_numero,
        });

        if (!validacion.valido) {
          throw new Error(`Elección ${eleccionId}: ${validacion.mensaje}`);
        }

        // Obtener el número de mesa para esta elección
        const mesa_numero = await VotosModel.getNroMesaPorCircuitoYEleccion(
          circuito_direccion,
          circuito_numero,
          parseInt(eleccionId)
        );

        const hash_integridad = VotosModel.generarHashIntegridad();
        const id_generado = `${transaccion_id}-${eleccionId}`;
        const estado_inicial = 'Emitido'; // Los votos en blanco no pueden ser observados

        // Queries para voto en blanco
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
            params: [hora_emision, hash_integridad, estado_inicial, 'Blanco', circuito_direccion, circuito_numero],
          },
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
            params: [parseInt(eleccionId), mesa_numero, ciudadano_credencial, id_generado, hora_emision],
          },
        ];

        // Ejecutar transacción para voto en blanco
        const results = await executeTransaction(queries);
        const votoId = results[0].insertId;

        resultados.push({
          eleccion_id: parseInt(eleccionId),
          voto_id: votoId,
          tipo: 'Blanco',
          transaccion_id: id_generado,
        });
      }

      return {
        transaccion_id,
        votos: resultados,
        total_elecciones: resultados.length,
      };
    } catch (error) {
      mysqlLogger.error('Error enviando voto:', error);
      throw error;
    }
  }

  static async validarVoto(votoData) {
    try {
      const { ciudadano_credencial, elecciones_ids, circuito_direccion, circuito_numero } = votoData;

      // Validar cada elección
      for (const eleccionId of elecciones_ids) {
        const validacion = await VotosModel.validarVotoParaEleccion({
          ciudadano_credencial,
          eleccion_id: eleccionId,
          circuito_direccion,
          circuito_numero,
        });

        if (!validacion.valido) {
          return { valido: false, mensaje: `Elección ${eleccionId}: ${validacion.mensaje}` };
        }
      }

      return { valido: true, mensaje: 'Todas las elecciones son válidas para votar' };
    } catch (error) {
      mysqlLogger.error('Error validando voto:', error);
      throw error;
    }
  }

  static async validarVotoParaEleccion(votoData) {
    try {
      const { ciudadano_credencial, eleccion_id, circuito_direccion, circuito_numero } = votoData;

      const mesa_numero = await VotosModel.getNroMesaPorCircuitoYEleccion(circuito_direccion, circuito_numero, eleccion_id);

      const yaVoto = await VotosModel.verificarYaVoto(ciudadano_credencial, eleccion_id);
      if (yaVoto) {
        return { valido: false, mensaje: 'El ciudadano ya ha votado en esta elección' };
      }

      const eleccionActiva = await VotosModel.verificarEleccionActiva(eleccion_id);
      if (!eleccionActiva) {
        return { valido: false, mensaje: 'La elección no está activa' };
      }

      // Validar que la mesa esté abierta
      const mesaAbierta = await CircuitosModel.isMesaAbierta(eleccion_id, mesa_numero);
      if (!mesaAbierta) {
        return { valido: false, mensaje: 'La mesa de votación no está abierta' };
      }

      return { valido: true, mensaje: 'Voto válido' };
    } catch (error) {
      mysqlLogger.error('Error validando voto para elección:', error);
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
      const voto = await executeQuery('SELECT estado_actual FROM Voto WHERE id = ?', [idVoto]);

      if (!voto || voto.length === 0) {
        throw new Error('Voto no encontrado');
      }

      if (voto[0].estado_actual !== 'Emitido Observado') {
        throw new Error('El voto no está en estado observado');
      }

      const queries = [
        {
          query: `UPDATE Voto SET estado_actual = 'Aprobado Presidente Mesa' WHERE id = ?`,
          params: [idVoto],
        },
        {
          query: `
            UPDATE Observado 
            SET hora_aprobado = NOW(), fk_integrantemesa_nro_credencial = ? 
            WHERE fk_voto_id = ?
          `,
          params: [credencialIntegrante, idVoto],
        },
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

  static async getNroMesaPorCircuitoYEleccion(direccion, numero, eleccionId) {
    try {
      const query = `
        SELECT fm.nro_mesa 
        FROM FormulaMesa fm
        JOIN Eleccion e ON fm.fk_eleccion_id = e.id
        WHERE fm.fk_circuito_establecimiento_direccion = ? 
          AND fm.fk_circuito_nro = ? 
          AND e.id = ?
      `;
      const result = await executeQuery(query, [direccion, numero, eleccionId]);
      return result[0] ? result[0].nro_mesa : null;
    } catch (error) {
      mysqlLogger.error('Error obteniendo número de mesa por circuito y elección:', error);
      throw error;
    }
  }

  static generarHashIntegridad() {
    return crypto.randomBytes(32).toString('hex');
  }

  static generarIdUnico() {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${randomBytes}`;
  }
}

module.exports = VotosModel;
