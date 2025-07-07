import { apiConnector } from './service-utils';

export const reportesService = {
  getResultadosPorListaEnCircuito: async (direccion, numero, eleccionId) => {
    const response = await apiConnector.get(
      `/reportes/circuito/${encodeURIComponent(direccion)}/${numero}/${eleccionId}/por-lista`
    );
    return response.data.data;
  },

  getResultadosAgregadosPorPartidoEnCircuito: async (direccion, numero, eleccionId) => {
    const response = await apiConnector.get(
      `/reportes/circuito/${encodeURIComponent(direccion)}/${numero}/${eleccionId}/por-partido`
    );
    return response.data.data;
  },

  getResultadosPorCandidatoEnCircuito: async (direccion, numero, eleccionId) => {
    const response = await apiConnector.get(
      `/reportes/circuito/${encodeURIComponent(direccion)}/${numero}/${eleccionId}/por-candidato`
    );
    return response.data.data;
  },

  getResultadosPorPartidoEnDepartamento: async (departamentoId, eleccionId) => {
    const response = await apiConnector.get(`/reportes/departamento/${departamentoId}/${eleccionId}/por-partido`);
    return response.data.data;
  },

  getResultadosPorCandidatoEnDepartamento: async (departamentoId, eleccionId) => {
    const response = await apiConnector.get(`/reportes/departamento/${departamentoId}/${eleccionId}/por-candidato`);
    return response.data.data;
  },

  getCandidatosGanadoresPorDepartamento: async (eleccionId) => {
    const response = await apiConnector.get(`/reportes/eleccion/${eleccionId}/ganadores-departamento`);
    return response.data.data;
  },
};
