import { apiConnector } from './service-utils';

class CircuitosService {
  static async nroCircuitoPorIp() {
    const response = await apiConnector.get('/circuitos/totem');
    return response.data;
  }
}

export default CircuitosService;
