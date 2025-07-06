import { apiConnector } from './service-utils';

class EleccionesService {
    static async getEleccionesActivas() {
        const response = await apiConnector.get('/elecciones/activas');
        return response.data;
    }

    static async getListasEleccion(electionId) {
        const response = await apiConnector.get(`/elecciones/${electionId}/papeletas`);
        return response.data;
    }

    static async getStatsEleccion(electionId) {
        const response = await apiConnector.get(`/elecciones/${electionId}/estadisticas`);
        return response.data;
    }
}

export default EleccionesService;