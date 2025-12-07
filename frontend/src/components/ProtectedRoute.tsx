import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { type ReactNode, type FC } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('CLIENT' | 'SELLER' | 'ADMIN')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return <div>Cargando sesión...</div>;
  }

  // 1. No autenticado? Redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // 2. Autenticado, pero se requieren roles específicos?
  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = allowedRoles.some(role => hasRole(role));
    
    if (!isAuthorized) {
      // Si no tiene el rol, redirigir a una página de "Acceso Denegado"
      return <Navigate to="/" replace />; 
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;