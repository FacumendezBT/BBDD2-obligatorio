import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CandidateCard({ lista, onVotar, isPresidential = true }) {

  // Función para obtener el color del círculo
  const getCircleColor = () => {
    if (isPresidential) {
      return 'bg-blue-600';
    }
    if (lista.color) {
      return '';
    }
    return lista.es_si ? 'bg-blue-500' : 'bg-pink-500';
  };

  return (
    <Card 
      className={`backdrop-blur-sm border transition-all duration-200 bg-white/95 hover:bg-white`}
      style={!isPresidential && lista.color ? {
        backgroundColor: 'white',
        borderColor: lista.color
      } : {}}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className={`w-12 h-12 text-white rounded-full flex items-center justify-center font-bold text-lg ${getCircleColor()}`}
                style={!isPresidential && lista.color ? {
                  backgroundColor: lista.color
                } : {}}
              >
                {isPresidential ? lista.numero : (lista.es_si ? 'SÍ' : 'NO')}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{lista.nombre}</h3>
                {isPresidential && lista.partido && (
                  <p className="text-sm text-gray-600">{lista.descripcion}</p>
                )}
              </div>
            </div>
            
            {/* Candidato principal para elecciones presidenciales */}
            {isPresidential && lista.candidato_principal && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Candidato Principal:</h4>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">1</span>
                    <span className="font-medium">{lista.candidato_principal}</span>
                  </div>
                  <span className="text-xs text-gray-500">Presidente</span>
                </div>
              </div>
            )}
            
            {/* Lista de candidatos para elecciones presidenciales */}
            {isPresidential && lista.candidatos && lista.candidatos.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Otros Candidatos:</h4>
                <div className="space-y-1">
                  {lista.candidatos.map((candidato, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{candidato.orden}</span>
                        <span className="font-medium">{candidato.nombre}</span>
                      </div>
                      <span className="text-xs text-gray-500">{candidato.cargo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Descripción */}
            {lista.descripcion && !lista.isPresidential && (
              <p className="text-sm text-gray-600 mb-4">{lista.descripcion}</p>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <Button 
            onClick={()=> onVotar(lista)}
            className={`w-full font-semibold py-3 transition-colors ${
              isPresidential ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-white'
            }`}
            style={!isPresidential && lista.color ? {
              backgroundColor: lista.color,
              borderColor: lista.color
            } : {}}
          >
            {isPresidential ? `Votar por Lista ${lista.numero}` : `Votar ${lista.nombre}`}
          </Button>
        </div>
      </div>
    </Card>
  );
}
