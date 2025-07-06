import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectAuthLoading, selectUser } from '@/store/auth-slice';
import { useAppSelector } from '@/store/hooks';

export function VotanteLayout({ children }) {
  const location = useLocation();
  const isAuth = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectAuthLoading);

  if (isLoading) {
    return <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>;
  }

  console.log('VotanteLayout - isAuth:', isAuth, 'user:', user);

  if (!isAuth || (user && user.tipo !== 'votante' && user.tipo !== 'observado')) {
    return <Navigate to="/votante" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
