import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import totemReducer from './totem-slice';
import eleccionesReducer from './elecciones-slice';
import { notificationMiddleware } from './notificationMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    totem: totemReducer,
    elecciones: eleccionesReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(notificationMiddleware),
});

export default store;
