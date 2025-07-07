import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  cargarEleccionesActivas,
  selectEleccionesActivas,
  selectEleccionesError,
} from '@/store/elecciones-slice';
import ErrorTotem from '@/components/ErrorTotem';

export default function ActiveElecciones() {
  const dispatch = useAppDispatch();
  const eleccionesActivas = useAppSelector(selectEleccionesActivas);
  const error = useAppSelector(selectEleccionesError);

  useEffect(() => {
    dispatch(cargarEleccionesActivas());
  }, [dispatch]);

  if (error) {
    return <ErrorTotem error={error} />;
  }

  if (eleccionesActivas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/70 text-lg">No hay elecciones activas en este momento</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center h-full">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-white mb-2">Preparando Votación</h2>
      <p className="text-white/90">Iniciando proceso de votación...</p>
    </div>
  );
}
