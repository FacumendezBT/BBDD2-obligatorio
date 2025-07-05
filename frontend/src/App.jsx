import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/layouts/ProtectedRoute';
import { AppLayout } from './components/layouts/AppLayout';
import VoterAuthPage from './pages/VoterAuthPage';

export default function App() {
  return (
    <Routes>
      {/* Routes without protection */}
      <Route>
        <Route path="/votante" element={<VoterAuthPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      ></Route>
    </Routes>
  );
}
