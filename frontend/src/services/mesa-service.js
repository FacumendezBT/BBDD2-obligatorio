import { apiConnector } from './service-utils';

export const mesaService = {
  // Obtener mesas del usuario logueado
  getMesasUsuario: async () => {
    const response = await apiConnector.get('/circuitos/usuario/mesas');
    return response.data.data; // Extraer el array de la respuesta
  },

  // Obtener información de una mesa específica
  getInfoMesa: async (electionId, mesaNumber) => {
    const response = await apiConnector.get(`/circuitos/mesa/${electionId}/${mesaNumber}`);
    return response.data;
  },

  // Obtener estado de una mesa
  getEstadoMesa: async (electionId, mesaNumber) => {
    const response = await apiConnector.get(`/circuitos/mesa/${electionId}/${mesaNumber}/estado`);
    return response.data.data; // Extraer el objeto de la respuesta
  },

  // Abrir una mesa
  abrirMesa: async (electionId, mesaNumber) => {
    const response = await apiConnector.put(`/circuitos/mesa/${electionId}/${mesaNumber}/abrir`);
    return response.data;
  },

  // Cerrar una mesa
  cerrarMesa: async (electionId, mesaNumber) => {
    const response = await apiConnector.put(`/circuitos/mesa/${electionId}/${mesaNumber}/cerrar`);
    return response.data;
  },
};
