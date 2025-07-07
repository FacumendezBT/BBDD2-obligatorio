import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  cargarListasEleccion,
  selectEleccionSeleccionada,
  selectListasEleccion,
  selectEleccionesLoading,
  selectEleccionesError,
  selectEleccionesActivas,
  selectCurrentElectionIndex,
  nextElection,
} from '@/store/elecciones-slice';
import { registrarVoto, completarVotacion, selectVotes } from '@/store/voting-slice';
import CandidateCard from './CandidateCard';
import { LucideTriangleAlert } from 'lucide-react';

export default function ListasEleccion() {
  const dispatch = useAppDispatch();
  const eleccionSeleccionada = useAppSelector(selectEleccionSeleccionada);
  const eleccionesActivas = useAppSelector(selectEleccionesActivas);
  const currentElectionIndex = useAppSelector(selectCurrentElectionIndex);
  const listas = useAppSelector(selectListasEleccion);
  const isLoading = useAppSelector(selectEleccionesLoading);
  const error = useAppSelector(selectEleccionesError);
  const votes = useAppSelector(selectVotes);
  const hasVotedForCurrentElection = votes.some((vote) => vote.eleccion_id === eleccionSeleccionada?.id);

  useEffect(() => {
    if (eleccionSeleccionada) {
      dispatch(cargarListasEleccion(eleccionSeleccionada.id));
    }
  }, [dispatch, eleccionSeleccionada]);

  const handleVotar = (lista) => {
    dispatch(
      registrarVoto({
        eleccionId: eleccionSeleccionada.id,
        lista: lista,
      })
    );

    if (currentElectionIndex < eleccionesActivas.length - 1) {
      dispatch(nextElection());
    } else {
      dispatch(completarVotacion());
    }
  };

  const handleVotarEnBlanco = () => {
    dispatch(
      registrarVoto({
        eleccionId: eleccionSeleccionada.id,
        lista: { tipo: 'Blanco' },
      })
    );

    if (currentElectionIndex < eleccionesActivas.length - 1) {
      dispatch(nextElection());
    } else {
      dispatch(completarVotacion());
    }
  };

  const isPresidentialElection = (listas) => {
    return listas.length > 0 && Object.prototype.hasOwnProperty.call(listas[0], 'nro_lista');
  };

  const transformListaData = (lista) => {
    if (lista.nro_lista) {
      return {
        id: lista.fk_papeleta_id,
        numero: lista.nro_lista,
        nombre: lista.partido_nombre,
        partido: lista.partido_nombre,
        descripcion: lista.papeleta_descripcion,
        candidato_principal: lista.candidato_nombre,
        candidatos: lista.participantes
          ? lista.participantes.map((p) => ({
              nombre: p.participante_nombre,
              cargo: p.organo_candidato,
              credencial: p.participante_credencial,
              orden: p.participante_orden,
            }))
          : [],
        departamento: lista.departamento_nombre,
      };
    } else {
      return {
        id: lista.id,
        numero: lista.es_si ? 'SÍ' : 'NO',
        nombre: lista.es_si ? 'SÍ' : 'NO',
        descripcion: lista.descripcion,
        color: lista.color,
        es_si: lista.es_si,
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
        <p className="text-white/90 mb-4 max-w-[400px] text-center">
          No se pudieron cargar las listas electorales, favor de contactar con un miembro de mesa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex-1 w-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-semibold mb-2">{eleccionSeleccionada?.nombre}</h2>
          <p className="text-white/70">Tipo de Elección: {eleccionSeleccionada?.tipo}</p>
          <p className="text-white/70">
            Elección {currentElectionIndex + 1} de {eleccionesActivas.length}
          </p>
          {hasVotedForCurrentElection && <p className="text-green-400 font-semibold">✓ Ya has votado en esta elección</p>}
        </div>
      </div>
      {listas.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-white/70 text-lg">No hay listas disponibles para esta elección</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformedListas.map((lista) => (
              <CandidateCard key={lista.id || lista.numero} lista={lista} onVotar={handleVotar} isPresidential={isPres} />
            ))}
          </div>

          {/* Voto en Blanco */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleVotarEnBlanco}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 text-lg font-semibold rounded-lg border-2 border-gray-500 hover:border-gray-400 transition-all duration-200"
            >
              Votar en Blanco
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
