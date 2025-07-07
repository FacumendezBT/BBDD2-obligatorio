import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConfirmacionModal from '@/components/ConfirmacionModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser, logout } from '@/store/auth-slice';
import { useNavigate } from 'react-router-dom';
import { mesaService } from '@/services/mesa-service';
import { reportesService } from '@/services/reportes-service';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Users, Calendar, MapPin, BarChart3, LogOut, Settings, Clock } from 'lucide-react';

export default function MiembroMesaPanel() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuth = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [estadoMesa, setEstadoMesa] = useState(null);
  const [reportes, setReportes] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [mostrarModalCerrar, setMostrarModalCerrar] = useState(false);

  const cargarReportes = useCallback(async (mesa) => {
    try {
      const [reporteListas, reportePartidos, reporteCandidatos] = await Promise.all([
        reportesService.getResultadosPorListaEnCircuito(
          mesa.fk_circuito_establecimiento_direccion,
          mesa.fk_circuito_nro,
          mesa.fk_eleccion_id
        ),
        reportesService.getResultadosAgregadosPorPartidoEnCircuito(
          mesa.fk_circuito_establecimiento_direccion,
          mesa.fk_circuito_nro,
          mesa.fk_eleccion_id
        ),
        reportesService.getResultadosPorCandidatoEnCircuito(
          mesa.fk_circuito_establecimiento_direccion,
          mesa.fk_circuito_nro,
          mesa.fk_eleccion_id
        ),
      ]);

      setReportes({
        listas: reporteListas,
        partidos: reportePartidos,
        candidatos: reporteCandidatos,
      });
    } catch (error) {
      console.error('Error cargando reportes:', error);
      toast.error('Error al cargar los reportes');
    }
  }, []);

  const cargarInfoMesa = useCallback(
    async (mesa) => {
      try {
        const estadoData = await mesaService.getEstadoMesa(mesa.fk_eleccion_id, mesa.nro_mesa);
        setEstadoMesa(estadoData);

        // Si la mesa está cerrada, cargar reportes
        if (estadoData.estado_actual.estado === 'Cerrado') {
          await cargarReportes(mesa);
        }
      } catch (error) {
        console.error('Error cargando info de mesa:', error);
      }
    },
    [cargarReportes]
  );

  const cargarMesasUsuario = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mesaService.getMesasUsuario();
      setMesas(data);

      // Seleccionar la primera mesa activa por defecto
      if (data.length > 0) {
        const mesaActiva =
          data.find((m) => new Date(m.fecha_hora_inicio) <= new Date() && new Date(m.fecha_hora_fin) >= new Date()) || data[0];

        setMesaSeleccionada(mesaActiva);
        await cargarInfoMesa(mesaActiva);
      }
    } catch (error) {
      toast.error('Error al cargar las mesas del usuario');
      console.error('Error cargando mesas:', error);
    } finally {
      setLoading(false);
    }
  }, [cargarInfoMesa]);

  useEffect(() => {
    if (!isAuth) {
      navigate('/miembro-mesa/login');
      return;
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    if (isAuth) {
      cargarMesasUsuario();
    }
  }, [isAuth, cargarMesasUsuario]);

  const abrirMesa = async () => {
    if (!mesaSeleccionada) return;

    try {
      setLoadingAction(true);
      await mesaService.abrirMesa(mesaSeleccionada.fk_eleccion_id, mesaSeleccionada.nro_mesa);
      toast.success('Mesa abierta exitosamente');
      await cargarInfoMesa(mesaSeleccionada);
    } catch (error) {
      toast.error('Error al abrir la mesa');
      console.error('Error abriendo mesa:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const cerrarMesa = async () => {
    if (!mesaSeleccionada) return;
    setMostrarModalCerrar(true);
  };

  const confirmarCerrarMesa = async () => {
    if (!mesaSeleccionada) return;

    try {
      setLoadingAction(true);
      await mesaService.cerrarMesa(mesaSeleccionada.fk_eleccion_id, mesaSeleccionada.nro_mesa);
      toast.success('Mesa cerrada exitosamente');
      await cargarInfoMesa(mesaSeleccionada);
      setMostrarModalCerrar(false);
    } catch (error) {
      toast.error('Error al cerrar la mesa');
      console.error('Error cerrando mesa:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const cambiarMesa = async (mesa) => {
    setMesaSeleccionada(mesa);
    await cargarInfoMesa(mesa);
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Abierto':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Abierta
          </Badge>
        );
      case 'Cerrado':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Cerrada
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertCircle className="w-4 h-4 mr-1" />
            Sin Estado
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de mesa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/corte-electoral.png" alt="Logo" className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel Miembro de Mesa</h1>
                <p className="text-sm text-gray-500">
                  {user?.nombre} - {user?.tipo?.charAt(0).toUpperCase() + user?.tipo?.slice(1)}
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selector de Mesa */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Mesas Asignadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(mesas) && mesas.length > 0 ? (
                    mesas.map((mesa) => (
                      <div
                        key={`${mesa.fk_eleccion_id}-${mesa.nro_mesa}`}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          mesaSeleccionada?.fk_eleccion_id === mesa.fk_eleccion_id && mesaSeleccionada?.nro_mesa === mesa.nro_mesa
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => cambiarMesa(mesa)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Mesa {mesa.nro_mesa}</p>
                            <p className="text-sm text-gray-500">{mesa.eleccion_nombre}</p>
                            <p className="text-xs text-gray-400">{mesa.rol_usuario}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={mesa.es_accesible ? 'default' : 'secondary'}>
                              {mesa.es_accesible ? 'Accesible' : 'No accesible'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No hay mesas asignadas</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Principal */}
          <div className="lg:col-span-2">
            {mesaSeleccionada && (
              <div className="space-y-6">
                {/* Información de la Mesa */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Mesa {mesaSeleccionada.nro_mesa}
                      </div>
                      {estadoMesa && getEstadoBadge(estadoMesa.estado_actual.estado)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Información General</h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Elección:</span> {mesaSeleccionada.eleccion_nombre}
                          </p>
                          <p>
                            <span className="font-medium">Tipo:</span> {mesaSeleccionada.eleccion_tipo}
                          </p>
                          <p>
                            <span className="font-medium">Circuito:</span> {mesaSeleccionada.fk_circuito_nro}
                          </p>
                          <p>
                            <span className="font-medium">Su rol:</span> {mesaSeleccionada.rol_usuario}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Horarios</h4>
                        <div className="space-y-2 text-sm">
                          <p className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Inicio: {new Date(mesaSeleccionada.fecha_hora_inicio).toLocaleString('es-ES')}
                          </p>
                          <p className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Fin: {new Date(mesaSeleccionada.fecha_hora_fin).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Acciones de Mesa */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Acciones de Mesa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-3">
                      {!estadoMesa || estadoMesa.estado_actual.estado !== 'Abierto' ? (
                        <Button onClick={abrirMesa} disabled={loadingAction} className="bg-green-600 hover:bg-green-700">
                          {loadingAction ? 'Abriendo...' : 'Abrir Mesa'}
                        </Button>
                      ) : (
                        <Button onClick={cerrarMesa} disabled={loadingAction} variant="destructive">
                          {loadingAction ? 'Cerrando...' : 'Cerrar Mesa'}
                        </Button>
                      )}

                      {mesaSeleccionada.rol_usuario !== 'Presidente' && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Solo el presidente puede abrir/cerrar la mesa
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Reportes */}
                {estadoMesa &&
                  estadoMesa.estado_actual.estado === 'Cerrado' &&
                  (Array.isArray(reportes.listas) || Array.isArray(reportes.partidos) || Array.isArray(reportes.candidatos)) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart3 className="w-5 h-5 mr-2" />
                          Reportes de Resultados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Resultados por Lista */}
                          {Array.isArray(reportes.listas) && reportes.listas.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Resultados por Lista</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-2 text-left">Lista</th>
                                      <th className="px-3 py-2 text-left">Partido</th>
                                      <th className="px-3 py-2 text-right">Votos</th>
                                      <th className="px-3 py-2 text-right">Porcentaje</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {reportes.listas.map((item, index) => (
                                      <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium">{item.nro_lista}</td>
                                        <td className="px-3 py-2">{item.nombre_partido}</td>
                                        <td className="px-3 py-2 text-right">{item.cantidad_votos}</td>
                                        <td className="px-3 py-2 text-right">{item.porcentaje}%</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Resultados por Partido */}
                          {Array.isArray(reportes.partidos) && reportes.partidos.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Resultados por Partido</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-2 text-left">Partido</th>
                                      <th className="px-3 py-2 text-right">Votos</th>
                                      <th className="px-3 py-2 text-right">Porcentaje</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {reportes.partidos.map((item, index) => (
                                      <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium">{item.nombre_partido}</td>
                                        <td className="px-3 py-2 text-right">{item.cantidad_votos}</td>
                                        <td className="px-3 py-2 text-right">{item.porcentaje}%</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Resultados por Candidato */}
                          {Array.isArray(reportes.candidatos) && reportes.candidatos.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Resultados por Candidato</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-2 text-left">Partido</th>
                                      <th className="px-3 py-2 text-left">Candidato</th>
                                      <th className="px-3 py-2 text-right">Votos</th>
                                      <th className="px-3 py-2 text-right">Porcentaje</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {reportes.candidatos.map((item, index) => (
                                      <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium">{item.nombre_partido}</td>
                                        <td className="px-3 py-2">{item.nombre_candidato}</td>
                                        <td className="px-3 py-2 text-right">{item.cantidad_votos}</td>
                                        <td className="px-3 py-2 text-right">{item.porcentaje}%</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Mensaje cuando no hay datos */}
                          {(!Array.isArray(reportes.listas) || reportes.listas.length === 0) &&
                            (!Array.isArray(reportes.partidos) || reportes.partidos.length === 0) &&
                            (!Array.isArray(reportes.candidatos) || reportes.candidatos.length === 0) && (
                              <div className="text-center py-8 text-gray-500">
                                <p>No hay datos de reportes disponibles</p>
                              </div>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación para cerrar mesa */}
      <ConfirmacionModal
        isOpen={mostrarModalCerrar}
        onClose={() => setMostrarModalCerrar(false)}
        onConfirm={confirmarCerrarMesa}
        title="Cerrar Mesa"
        message="¿Está seguro que desea cerrar la mesa? Esta acción no se puede deshacer y no se podrán registrar más votos."
        loading={loadingAction}
      />
    </div>
  );
}
