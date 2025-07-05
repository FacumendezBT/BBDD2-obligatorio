import { toast } from 'sonner';

// Middleware para el manejo de notificaciones
// Este middleware interceptará las acciones y mostrará notificaciones basadas en su tipo
// También manejará errores de thunks asíncronos que sean rechazados
// y mostrará mensajes de error apropiados usando las notificaciones de Sonner
export const notificationMiddleware = () => (next) => (action) => {
  if (typeof action.type === 'string' && action.type.endsWith('/rejected') && action.payload) {
    const payload = action.payload;
    const message = payload.message || 'Ocurrió un error';
    const errorCode = payload.status || payload.errorCode;

    console.log('Middleware de Notificaciones:', {
      action,
      payload,
      message,
      errorCode,
    });

    // Mostrar notificación de error
    toast.error(message, {
      description: errorCode ? `Código de error: ${errorCode}` : undefined,
      duration: 3500,
    });
  }

  // Manejar acciones exitosas si tienen el patrón fulfilled
  if (typeof action.type === 'string' && action.type.endsWith('/fulfilled')) {
    // Aquí puedes agregar lógica para notificaciones de éxito si es necesario
    console.log('Acción exitosa:', action.type);
  }

  return next(action);
};
