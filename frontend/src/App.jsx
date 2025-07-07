import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import HomePage from './pages/HomePage';
import VoterAuthPage from './pages/VoterAuthPage';
import VoteInterface from './pages/VoteInterface';
import MiembroMesaAuthPage from './pages/MiembroMesaAuthPage';
import MiembroMesaPanel from './pages/MiembroMesaPanel';
import { VotanteLayout } from './components/layouts/VotanteLayout';
import { cargarCircuitoPorIp, selectTotemLoading, selectTotemError, selectTotemIsInitialized } from './store/totem-slice';
import ErrorTotem from './components/ErrorTotem';
import LoaderTotem from './components/LoaderTotem';

export default function App() {
  const dispatch = useDispatch();
  const isTotemLoading = useSelector(selectTotemLoading);
  const totemError = useSelector(selectTotemError);
  const isTotemInitialized = useSelector(selectTotemIsInitialized);

  useEffect(() => {
    dispatch(cargarCircuitoPorIp());
  }, [dispatch]);

  if (isTotemLoading || !isTotemInitialized) {
    return <LoaderTotem />;
  }

  if (totemError) {
    return <ErrorTotem retry={() => dispatch(cargarCircuitoPorIp())} error={totemError} />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/votante" element={<VoterAuthPage />} />
      <Route
        path="/votante/votar"
        element={
          <VotanteLayout>
            <VoteInterface />
          </VotanteLayout>
        }
      />
      <Route path="/miembro-mesa/login" element={<MiembroMesaAuthPage />} />
      <Route path="/miembro-mesa/panel" element={<MiembroMesaPanel />} />
    </Routes>
  );
}
