import React from 'react';
import { Card } from '@/components/ui/card';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/auth-slice';
import { selectTotem } from '@/store/totem-slice';
import { selectEleccionSeleccionada } from '@/store/elecciones-slice';
import ActiveElecciones from '@/components/ActiveElecciones';
import ListasEleccion from '@/components/ListasEleccion';

export default function VoteInterface() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const eleccionSeleccionada = useAppSelector(selectEleccionSeleccionada);
  const dataCircuito = useAppSelector(selectTotem);

  const isObservado = user?.tipo === 'observado';


  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {/* Indicador de que estás votando observado */}
        {isObservado && (
          <div className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold">VOTANDO OBSERVADO</span>
          </div>
        )}
        
        <Card className="w-full max-w-7xl shadow-xl overflow-auto bg-[#002879] h-[90vh]">
          <div className="p-8 flex flex-col items-center justify-between h-full">
            <div className="flex items-center justify-between mb-8 w-full">
              <div className="flex items-center gap-4">
                <img src="/corte-electoral.png" alt="Corte Electoral" className="w-12 h-15 object-cover" />
                <div>
                  <h1 className="text-white text-3xl font-bold">Sistema de Votación Electrónica</h1>
                  <p className="text-white/70">
                    {eleccionSeleccionada ? 'Seleccione una lista para votar' : 'Seleccione una elección para votar'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70">Circuito {dataCircuito.nroCircuito}</p>
                <p className="text-white/70">{dataCircuito.direccionCircuito}</p>
              </div>
            </div>

            {eleccionSeleccionada ? <ListasEleccion /> : <ActiveElecciones />}
          </div>
        </Card>
      </div>
    );
  }
}
