import React from 'react';
import { Card } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/auth-slice';
import { selectTotem } from '@/store/totem-slice';
import ActiveElecciones from '@/components/ActiveElecciones';

export default function VoteInterface() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const dataCircuito = useAppSelector(selectTotem);


  // Si el usuario está autenticado, mostrar las elecciones
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-7xl shadow-xl overflow-auto bg-[#002879] h-[90vh]">
          <div className="p-8 flex flex-col items-center justify-between h-full">
            <div className="flex items-center justify-between mb-8 w-full">
              <div className="flex items-center gap-4">
                <img src="/corte-electoral.png" alt="Corte Electoral" className="w-12 h-15 object-cover" />
                <div>
                  <h1 className="text-white text-3xl font-bold">Sistema de Votación Electrónica</h1>
                  <p className="text-white/70">Seleccione una elección para votar</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70">Circuito {dataCircuito.nroCircuito}</p>
                <p className="text-white/70">{dataCircuito.direccionCircuito}</p>
              </div>
            </div>

            <ActiveElecciones />
          </div>
        </Card>
      </div>
    );
  }
}
