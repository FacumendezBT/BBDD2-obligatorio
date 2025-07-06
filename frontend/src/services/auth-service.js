import { apiConnector } from './service-utils';

class AuthService {
  static async loginVotante(credencial) {
    const response = await apiConnector.post('/auth/login', {
      credencial,
    });
    return response.data;
  }

  static async loginUsuario(credencial, password) {
    const response = await apiConnector.post('/auth/login', {
      credencial,
      password,
    });
    return response.data;
  }

  static async logout() {
    const response = await apiConnector.post('/auth/logout');
    return response.data;
  }
}

export default AuthService;
