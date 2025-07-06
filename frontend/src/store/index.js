import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import totemReducer from './totem-slice';
import { notificationMiddleware } from './notificationMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    totem: totemReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(notificationMiddleware),
});

export default store;
