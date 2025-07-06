import { toast } from 'sonner';

export const notificationMiddleware = () => (next) => (action) => {
  if (typeof action.type === 'string' && action.type.endsWith('/rejected') && action.payload) {
    const payload = action.payload;
    const message = payload.message || 'Ocurrió un error :(';
    const errorCode = payload.status || payload.errorCode;

    toast.error(message, {
      description: errorCode ? `Código de error: ${errorCode}` : undefined,
      duration: 3500,
    });
  }

  return next(action);
};
