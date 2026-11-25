import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { initialState, storeReducer } from './storeReducer';
import { setupInterceptors } from '../api/axiosClient';
import { authApi } from '../api/authApi';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  // Sincroniza el atributo nativo de Bootstrap 5.3+ para tema claro/oscuro
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', state.theme);
  }, [state.theme]);

  const notify = useCallback((variant, message) => {
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { variant, message } });
  }, []);

  const clearNotification = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATION' });
  }, []);

  const logout = useCallback(async () => {
    const currentRefresh = localStorage.getItem('biblioteca_refresh_token');
    try {
      if (currentRefresh) {
        await authApi.logout(currentRefresh);
      }
    } catch {
      // Si el token ya expiró en backend, igual limpiamos estado local
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Registra interceptores de Axios conectados al Store
  useEffect(() => {
    setupInterceptors({
      onTokenRefreshed: (tokens) => dispatch({ type: 'TOKEN_REFRESHED', payload: tokens }),
      onAuthFailure: () => {
        dispatch({ type: 'LOGOUT' });
        notify('warning', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      },
    });
  }, [notify]);

  const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), []);

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        toggleTheme,
        logout,
        notify,
        clearNotification,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

// Hooks personalizados para consumir el Store de forma limpia
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore debe usarse dentro de un StoreProvider');
  return context;
}

export function useAuth() {
  const { state, dispatch, logout } = useStore();
  const isBibliotecario = state.auth.user?.rol === 'ROLE_BIBLIOTECARIO';
  const isSocio = state.auth.user?.rol === 'ROLE_SOCIO';

  return {
    ...state.auth,
    isBibliotecario,
    isSocio,
    loginSuccess: (data) => dispatch({ type: 'LOGIN_SUCCESS', payload: data }),
    logout,
  };
}

export function useTheme() {
  const { state, toggleTheme } = useStore();
  return { theme: state.theme, toggleTheme };
}