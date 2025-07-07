import api from './service-utils';

const VotosService = {
  enviarVoto: async (votoData) => {
    try {
      const response = await api.post('/votos/enviar', votoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  validarVoto: async (votoData) => {
    try {
      const response = await api.post('/votos/validar', votoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  aprobarVoto: async (idVoto, credencialIntegrante) => {
    try {
      const response = await api.put(`/votos/aprobar/${idVoto}`, {
        credencial_integrante: credencialIntegrante
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  obtenerVotosPorCircuito: async (direccionCircuito, numeroCircuito) => {
    try {
      const response = await api.get(`/votos/circuito/${direccionCircuito}/${numeroCircuito}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default VotosService;
