import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectAuthLoading } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuth = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/votante" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
