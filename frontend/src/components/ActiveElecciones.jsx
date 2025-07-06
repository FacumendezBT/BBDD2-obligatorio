import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  cargarEleccionesActivas,
  selectEleccionesActivas,
  selectEleccionesLoading,
  selectEleccionesError,
  seleccionarEleccion,
} from '@/store/elecciones-slice';
import ErrorTotem from '@/components/ErrorTotem';

export default function ActiveElecciones() {
  const dispatch = useAppDispatch();
  const eleccionesActivas = useAppSelector(selectEleccionesActivas);
  const isLoading = useAppSelector(selectEleccionesLoading);
  const error = useAppSelector(selectEleccionesError);

  useEffect(() => {
    dispatch(cargarEleccionesActivas());
  }, [dispatch]);

  const handleSeleccionarEleccion = (eleccion) => {
    dispatch(seleccionarEleccion(eleccion));
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Cargando Elecciones</h2>
        <p className="text-white/90"> Cargando información de las elecciones activas...</p>
      </div>
    );
  }

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

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 flex-1">
      <h2 className="text-white text-2xl font-semibold mb-6">Elecciones Activas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eleccionesActivas.map((eleccion) => (
          <Card
            key={eleccion.id}
            className="bg-white/95 backdrop-blur-sm border border-white/20 hover:bg-white transition-all duration-200 cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{eleccion.nombre}</h3>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {eleccion.tipo}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Inicio:</p>
                  <p className="text-sm font-medium text-gray-900">{formatFecha(eleccion.fecha_hora_inicio)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fin:</p>
                  <p className="text-sm font-medium text-gray-900">{formatFecha(eleccion.fecha_hora_fin)}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => handleSeleccionarEleccion(eleccion)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Seleccionar Elección
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
