import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import { useAuth, useTheme } from '../../store/StoreContext';

jest.mock('../../store/StoreContext', () => ({
  useAuth: jest.fn(),
  useTheme: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('AppNavbar', () => {
  const mockToggleTheme = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useTheme.mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme });
  });

  test('muestra solo marca y botón de tema cuando no está autenticado', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isBibliotecario: false,
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <AppNavbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Biblioteca')).toBeInTheDocument();
    expect(screen.queryByText('Catálogo')).not.toBeInTheDocument();
    expect(screen.queryByText('Salir')).not.toBeInTheDocument();
  });

  test('muestra enlaces y badge de Bibliotecario cuando está autenticado', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'bibliotecario@biblioteca.cl' },
      isBibliotecario: true,
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <AppNavbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Catálogo')).toBeInTheDocument();
    expect(screen.getByText('Gestión de Préstamos')).toBeInTheDocument();
    expect(screen.getByText('Bibliotecario')).toBeInTheDocument();
    expect(screen.getByText('bibliotecario@biblioteca.cl')).toBeInTheDocument();
  });

  test('muestra "Mis Préstamos" y badge Socio para rol SOCIO', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'socio@biblioteca.cl' },
      isBibliotecario: false,
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <AppNavbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Mis Préstamos')).toBeInTheDocument();
    expect(screen.getByText('Socio')).toBeInTheDocument();
  });

  test('ejecuta toggleTheme y logout correctamente al hacer clic', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'socio@biblioteca.cl' },
      isBibliotecario: false,
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <AppNavbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTitle('Cambiar tema'));
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Salir'));
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});