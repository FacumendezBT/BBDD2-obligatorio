import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import VoterAuthPage from './pages/VoterAuthPage';
import VoteInterface from './pages/VoteInterface';
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
      <Route path="/votante" element={<VoterAuthPage />} />
      <Route path="/votante/votar" element={<VotanteLayout><VoteInterface/></VotanteLayout>} />
    </Routes>
  );
}
