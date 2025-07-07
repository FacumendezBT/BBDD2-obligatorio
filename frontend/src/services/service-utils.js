import axios from 'axios';
import { store } from '../store';
import { selectToken } from '../store/auth-slice';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiConnector = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token dinámicamente a cada request
apiConnector.interceptors.request.use(
  (config) => {
    const token = selectToken(store.getState());
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiConnector.interceptors.response.use(
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

export default apiConnector;
