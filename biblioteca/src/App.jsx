import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import AppNavbar from './components/layout/AppNavbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import CatalogoPage from './pages/CatalogoPage';
import PrestamosPage from './pages/PrestamosPage';
import { useAuth, useStore } from './store/StoreContext';

export default function App() {
  const { isAuthenticated } = useAuth();
  const { state, clearNotification } = useStore();

  return (
    <BrowserRouter>
      <div className="min-vh-100 bg-body text-body">
        <AppNavbar />

        <Container>
          <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1080 }}>
            <Toast
              bg={state.notification?.variant || 'info'}
              show={Boolean(state.notification)}
              onClose={clearNotification}
              delay={4000}
              autohide
            >
              <Toast.Header>
                <strong className="me-auto">Biblioteca</strong>
              </Toast.Header>
              <Toast.Body className="text-white">{state.notification?.message}</Toast.Body>
            </Toast>
          </ToastContainer>
        </Container>

        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/catalogo" replace /> : <LoginPage />}
          />
          <Route
            path="/catalogo"
            element={
              <ProtectedRoute>
                <CatalogoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prestamos"
            element={
              <ProtectedRoute>
                <PrestamosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/catalogo' : '/login'} replace />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}