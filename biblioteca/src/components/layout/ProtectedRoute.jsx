import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/StoreContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}