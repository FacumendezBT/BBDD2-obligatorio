const { executeQuery } = require('../config/database');
const { mysqlLogger } = require('../config/logger');

class CiudadanoModel {
  static async findciudadano(credencial) {
    try {
      const query = `
            SELECT 
              c.nro_credencial,
              c.cedula_identidad,
              c.nombre_completo,
              c.fecha_nacimiento,
            'votante' as user_type
            FROM Ciudadano c
            WHERE c.nro_credencial = ?
        `;
      const results = await executeQuery(query, [credencial]);
      return results[0] || null;
    } catch (error) {
      mysqlLogger.error('Error verificando existencia de ciudadano:', error);
      throw error;
    }
  }

  static async findByCredencial(credencial) {
    try {
      const query = `
                SELECT 
                    c.nro_credencial,
                    c.cedula_identidad,
                    c.nombre_completo,
                    c.fecha_nacimiento,
                    us.contraseña,
                    us.tipo as user_type
                FROM Ciudadano c
                LEFT JOIN UsuarioSistema us ON c.nro_credencial = us.fk_ciudadano_nro_credencial
                WHERE c.nro_credencial = ?
            `;

      const results = await executeQuery(query, [credencial]);
      return results[0] || null;
    } catch (error) {
      mysqlLogger.error('Error encontrando usuario por credencial:', error);
      throw error;
    }
  }

  static async isMesaMiembro(credencial) {
    try {
      const query = `
                SELECT tipo FROM IntegranteMesa 
                WHERE fk_usuariosistema_nro_credencial = ?
            `;

      const res = await executeQuery(query, [credencial]);
      return res.length > 0;
    } catch (error) {
      mysqlLogger.error('Error validando si es integrante de mesa:', error);
      throw error;
    }
  }

  static async isMesaPresidente(credencial) {
    try {
      const query = `
                SELECT tipo FROM IntegranteMesa 
                WHERE fk_usuariosistema_nro_credencial = ? AND tipo = 'Presidente'
            `;

      const res = await executeQuery(query, [credencial]);
      return res.length > 0;
    } catch (error) {
      mysqlLogger.error('Error validando si es presidente de mesa:', error);
      throw error;
    }
  }

  static async yaVoto(credencial, electionId) {
    try {
      const query = `
                SELECT COUNT(*) as vote_count
                FROM Vota v
                WHERE v.fk_ciudadano_nro_credencial = ?
                AND v.fk_formulam_eleccion_id = ?
            `;

      const res = await executeQuery(query, [credencial, electionId]);
      return res[0].vote_count > 0;
    } catch (error) {
      mysqlLogger.error('Error verificando si el ciudadano ya votó:', error);
      throw error;
    }
  }
}

module.exports = CiudadanoModel;
