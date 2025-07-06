import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  cargarListasEleccion,
  selectEleccionSeleccionada,
  selectListasEleccion,
  selectEleccionesLoading,
  selectEleccionesError,
  seleccionarEleccion
} from '@/store/elecciones-slice';
import CandidateCard from './CandidateCard';
import { toast } from 'sonner';
import { LucideTriangleAlert } from 'lucide-react';

export default function ListasEleccion() {
  const dispatch = useAppDispatch();
  const eleccionSeleccionada = useAppSelector(selectEleccionSeleccionada);
  const listas = useAppSelector(selectListasEleccion);
  const isLoading = useAppSelector(selectEleccionesLoading);
  const error = useAppSelector(selectEleccionesError);

  useEffect(() => {
    if (eleccionSeleccionada) {
      dispatch(cargarListasEleccion(eleccionSeleccionada.id));
    }
  }, [dispatch, eleccionSeleccionada]);

  const handleVolver = () => {
    dispatch(seleccionarEleccion(null));
  };

  const handleVotar = (lista) => {
    // Verificar si es el formato de elección presidencial/ballotage
    if (lista.nro_lista) {
      toast.success(`Voto registrado para la Lista ${lista.nro_lista} - ${lista.partido_nombre}`);
    } else {
      // Es referéndum o plebiscito
      toast.success(`Voto registrado: ${lista.descripcion}`);
    }
    console.log('Votando por:', lista);
  };

  // Función para determinar si es elección presidencial/ballotage
  const isPresidentialElection = (listas) => {
    return listas.length > 0 && Object.prototype.hasOwnProperty.call(listas[0], 'nro_lista');
  };

  // Función para transformar datos según el tipo de elección
  const transformListaData = (lista) => {
    if (lista.nro_lista) {
      // Formato presidencial/ballotage
      return {
        id: lista.fk_papeleta_id,
        numero: lista.nro_lista,
        nombre: lista.partido_nombre,
        partido: lista.partido_nombre,
        descripcion: lista.papeleta_descripcion,
        candidato_principal: lista.candidato_nombre,
        candidatos: lista.participantes ? lista.participantes.map(p => ({
          nombre: p.participante_nombre,
          cargo: p.organo_candidato,
          credencial: p.participante_credencial,
          orden: p.participante_orden
        })) : [],
        departamento: lista.departamento_nombre
      };
    } else {
      // Formato referéndum/plebiscito
      return {
        id: lista.id,
        numero: lista.es_si ? 'SÍ' : 'NO',
        nombre: lista.es_si ? 'SÍ' : 'NO',
        descripcion: lista.descripcion,
        color: lista.color,
        es_si: lista.es_si
      };
    }
  };

  const isPres = isPresidentialElection(listas);
  const transformedListas = listas.map(transformListaData);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Cargando Listas</h2>
        <p className="text-white/90">Cargando información de las listas electorales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full">
        <div className="text-red-500 mb-4">
          <LucideTriangleAlert className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Error al cargar</h2>
        <p className="text-white/90 mb-4 max-w-[400px] text-center">No se pudieron cargar las listas electorales, favor de contactar con un miembro de mesa.</p>
        <Button onClick={handleVolver} variant="primary" className="bg-red-500 text-white">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex-1 w-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-semibold mb-2">
            {eleccionSeleccionada?.nombre}
          </h2>
          <p className="text-white/70">Tipo de Elección: {eleccionSeleccionada?.tipo}</p>
        </div>
        <Button 
          onClick={handleVolver}
          variant="outline" 
          className="text-white border-white hover:bg-white hover:text-gray-900 bg-transparent"
        >
          ← Volver a Elecciones
        </Button>
      </div>
      {listas.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-white/70 text-lg">No hay listas disponibles para esta elección</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transformedListas.map((lista) => (
            <CandidateCard 
              key={lista.id || lista.numero} 
              lista={lista} 
              onVotar={handleVotar}
              isPresidential={isPres}
            />
          ))}
        </div>
      )}
    </div>
  );
}
