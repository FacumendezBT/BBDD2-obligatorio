import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { notificationMiddleware } from './notificationMiddleware';

// Configuración del store de Redux
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar estas acciones en el check de serialización
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(notificationMiddleware),
  devTools: import.meta.env.MODE !== 'production',
});

export default store;
