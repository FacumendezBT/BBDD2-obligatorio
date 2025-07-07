import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectVotes,
  selectIsSubmitting,
  selectSubmitError,
  selectSubmitSuccess,
  enviarVotoCompleto,
  prepararVotoCompleto,
  clearSubmitError,
  resetVoting,
} from '@/store/voting-slice';
import { selectUser, logout } from '@/store/auth-slice';
import { selectTotem } from '@/store/totem-slice';
import { selectEleccionesActivas } from '@/store/elecciones-slice';
import { toast } from 'sonner';
import { LucideCheck, LucideX, LucideLoader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VoteSubmission() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const votes = useAppSelector(selectVotes);
  const isSubmitting = useAppSelector(selectIsSubmitting);
  const submitError = useAppSelector(selectSubmitError);
  const submitSuccess = useAppSelector(selectSubmitSuccess);
  const user = useAppSelector(selectUser);
  const totem = useAppSelector(selectTotem);
  const eleccionesActivas = useAppSelector(selectEleccionesActivas);

  const handleSubmitVotes = async () => {
    try {
      dispatch(
        prepararVotoCompleto({
          ciudadano: {
            credencial: user.credencial,
            tipo: user.tipo,
          },
          circuito: {
            direccion: totem.direccionCircuito,
            numero: totem.nroCircuito,
          },
        })
      );

      const papeletasPorEleccion = {};

      votes.forEach((vote) => {
        if (!papeletasPorEleccion[vote.eleccion_id]) {
          papeletasPorEleccion[vote.eleccion_id] = [];
        }

        // Si es un voto en blanco, no agregamos papeletas
        if (vote.lista_seleccionada.tipo === 'Blanco') {
          return;
        }

        if (vote.lista_seleccionada.nro_lista) {
          papeletasPorEleccion[vote.eleccion_id].push({
            papeleta_id: vote.lista_seleccionada.id,
            nro_lista: vote.lista_seleccionada.nro_lista,
          });
        } else {
          papeletasPorEleccion[vote.eleccion_id].push({
            papeleta_id: vote.lista_seleccionada.id,
            es_si: vote.lista_seleccionada.es_si,
          });
        }
      });

      const voteData = {
        ciudadano_credencial: user.credencial,
        circuito_direccion: totem.direccionCircuito,
        circuito_numero: totem.nroCircuito,
        tipo: user.tipo === 'observado' ? 'Observado' : 'Normal',
        papeletas_por_eleccion: papeletasPorEleccion,
        votos_blancos: votes.filter((vote) => vote.lista_seleccionada.tipo === 'Blanco').map((vote) => vote.eleccion_id),
      };

      const result = await dispatch(enviarVotoCompleto(voteData)).unwrap();

      toast.success(`¡Voto enviado exitosamente para ${result.total_elecciones} elección(es)!`);

      setTimeout(() => {
        dispatch(resetVoting());
        dispatch(logout());
        navigate('/votante');
      }, 2000);
    } catch (error) {
      console.error('Error submitting votes:', error);
      toast.error('Error al enviar el voto. Intente nuevamente.');
    }
  };

  const handleClearError = () => {
    dispatch(clearSubmitError());
  };

  const getVoteDisplayData = (vote) => {
    const election = eleccionesActivas.find((e) => e.id === vote.eleccion_id);
    const lista = vote.lista_seleccionada;

    // Si es un voto en blanco
    if (lista.tipo === 'Blanco') {
      return {
        eleccionNombre: election?.nombre || 'Elección desconocida',
        eleccionTipo: election?.tipo || '',
        votoTexto: 'Voto en Blanco',
      };
    }

    return {
      eleccionNombre: election?.nombre || 'Elección desconocida',
      eleccionTipo: election?.tipo || '',
      votoTexto: lista.nro_lista
        ? `Lista ${lista.nro_lista} - ${lista.nombre}`
        : election?.tipo === 'Plebiscito'
        ? `${lista.nombre} (${lista.es_si ? 'SÍ' : 'NO'})`
        : lista.nombre,
    };
  };

  if (submitSuccess) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full">
        <div className="text-green-500 mb-4">
          <LucideCheck className="w-24 h-24 mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">¡Voto Enviado Exitosamente!</h2>
        <p className="text-white/90 mb-4 max-w-[400px] text-center">
          Su voto ha sido registrado correctamente para {votes.length} elección(es). Gracias por participar en el proceso
          democrático.
        </p>
        <div className="text-white/70 text-sm">Puede cerrar esta ventana o será redirigido automáticamente.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex-1 w-full flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-white text-2xl font-semibold mb-2">Confirmar Voto</h2>
        <p className="text-white/70">Revise sus selecciones antes de enviar el voto</p>
      </div>

      <Card className="bg-white/95 backdrop-blur-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Resumen de Votos</h3>
          <div className="space-y-4">
            {votes.map((vote, index) => {
              const displayData = getVoteDisplayData(vote);
              return (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{displayData.eleccionNombre}</h4>
                      <p className="text-sm text-gray-600">{displayData.eleccionTipo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{displayData.votoTexto}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {submitError && (
        <Card className="bg-red-50 border-red-200">
          <div className="p-4 flex items-center gap-3">
            <LucideX className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Error al enviar el voto</h4>
              <p className="text-sm text-red-700">{submitError.message || 'Ocurrió un error inesperado'}</p>
            </div>
            <Button
              onClick={handleClearError}
              variant="outline"
              size="sm"
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              Cerrar
            </Button>
          </div>
        </Card>
      )}

      <div className="flex gap-4 justify-center">
        <Button
          onClick={handleSubmitVotes}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-[#2E59AEFF] to-[#395CA2FF] hover:bg-gradient-to-r hover:from-[#2E59AEFF] hover:to-[#395CA2FF] text-white px-8 py-3 font-semibold"
        >
          {isSubmitting ? (
            <>
              <LucideLoader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando Voto...
            </>
          ) : (
            'Confirmar y Enviar Voto'
          )}
        </Button>
      </div>

      <div className="text-center text-white/70 text-sm">
        <p>Una vez enviado el voto, no podrá ser modificado.</p>
        <p>Asegúrese de revisar todas sus selecciones antes de confirmar.</p>
      </div>
    </div>
  );
}
