import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { useAuth, useTheme, useStore } from './store/StoreContext';

jest.mock('./store/StoreContext', () => ({
  useAuth: jest.fn(),
  useTheme: jest.fn(),
  useStore: jest.fn(),
}));

jest.mock('./api/librosApi', () => ({
  librosApi: {
    listarLibros: jest.fn(() => Promise.resolve({ data: [] })),
  },
}));

describe('App', () => {
  beforeEach(() => {
    useTheme.mockReturnValue({ theme: 'light', toggleTheme: jest.fn() });
    useStore.mockReturnValue({
      state: { libros: [], prestamos: [], loading: false, notification: null },
      dispatch: jest.fn(),
      notify: jest.fn(),
      clearNotification: jest.fn(),
    });
  });

  test('muestra LoginPage por defecto cuando el usuario no está autenticado', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isBibliotecario: false,
      loginSuccess: jest.fn(),
      logout: jest.fn(),
    });

    render(<App />);

    expect(screen.getByText('Acceso a Biblioteca')).toBeInTheDocument();
  });

  test('renderiza notificación Toast global cuando existe en el store', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'socio@biblioteca.cl' },
      isBibliotecario: false,
      logout: jest.fn(),
    });
    useStore.mockReturnValue({
      state: {
        libros: [],
        prestamos: [],
        loading: false,
        notification: { variant: 'success', message: 'Operación exitosa' },
      },
      dispatch: jest.fn(),
      notify: jest.fn(),
      clearNotification: jest.fn(),
    });

    render(<App />);

    expect(screen.getByText('Operación exitosa')).toBeInTheDocument();
  });
});