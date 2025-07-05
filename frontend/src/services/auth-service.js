import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || 'Error desconocido :(',
      status: error.response?.status || 500,
      data: error.response?.data || null,
    };

    return Promise.reject(customError);
  }
);

class AuthService {
  static async loginVotante(credencial) {
    const response = await api.post('/auth/login', {
      credencial,
    });
    return response.data;
  }

  static async loginUsuario(credencial, password) {
    const response = await api.post('/auth/login', {
      credencial,
      password,
    });
    return response.data;
  }

  static async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }
}

export default AuthService;
