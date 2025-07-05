import { selectIsAuthenticated, selectAuthLoading } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const location = useLocation();

  if (isLoading) {
    return <>{children}</>;
  }

  if (isAuth) {
    const from = location.state?.from?.pathname;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
