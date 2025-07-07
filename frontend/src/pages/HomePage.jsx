import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { selectTotem } from '@/store/totem-slice';
import { Users, Settings, Vote } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const dataCircuito = useAppSelector(selectTotem);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-xl overflow-auto bg-[#002879] min-h-[80vh]">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Columna con las opciones */}
          <div className="flex flex-col items-center justify-center pl-14 py-9">
            <div className="flex flex-col items-center gap-8 flex-1 justify-center">
              <div className="text-center">
                <img src="/corte-electoral.png" alt="Corte Electoral" className="w-16 h-20 object-cover mx-auto mb-6" />
                <h3 className="uppercase text-white/65 text-lg font-semibold mb-3 tracking-[0px] leading-relaxed">
                  ELECCIONES ELECTRÓNICAS 2024
                </h3>
                <h1 className="text-white/90 font-bold text-4xl mb-2">Tótem de Votación</h1>
                <p className="text-white/70 text-lg">Seleccione su tipo de acceso</p>
              </div>

              <div className="w-full max-w-md space-y-4">
                <Button
                  onClick={() => navigate('/votante')}
                  className="w-full h-16 text-lg font-semibold text-white bg-gradient-to-r from-[#2E59AEFF] to-[#395CA2FF] hover:from-[#1e4199] hover:to-[#2a4787] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Vote className="w-6 h-6" />
                  Acceso Votante
                </Button>

                <Button
                  onClick={() => navigate('/miembro-mesa/login')}
                  className="w-full h-16 text-lg font-semibold text-white bg-gradient-to-r from-[#6B7280] to-[#4B5563] hover:from-[#5B6370] hover:to-[#3B4553] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Settings className="w-6 h-6" />
                  Miembro de Mesa
                </Button>
              </div>

              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-white/80" />
                    <span className="text-white/80 font-medium">Información del Circuito</span>
                  </div>
                  <p className="text-white/90 text-sm">Circuito {dataCircuito.nroCircuito}</p>
                  <p className="text-white/70 text-xs mt-1">{dataCircuito.direccionCircuito}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna con la imagen del tótem */}
          <div className="flex items-center justify-center py-9 pl-12">
            <img
              src="/totem.svg"
              alt="Tótem de votación"
              className="w-full h-full max-w-full max-h-full object-contain opacity-90"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
