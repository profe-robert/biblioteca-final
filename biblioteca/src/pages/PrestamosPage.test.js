import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PrestamosPage from './PrestamosPage';
import { prestamosApi } from '../api/prestamosApi';
import { useAuth, useStore } from '../store/StoreContext';

jest.mock('../api/prestamosApi', () => ({
  prestamosApi: {
    listarTodos: jest.fn(),
    listarMisPrestamos: jest.fn(),
  },
}));

jest.mock('../store/StoreContext', () => ({
  useAuth: jest.fn(),
  useStore: jest.fn(),
}));

describe('PrestamosPage', () => {
  const mockDispatch = jest.fn();
  const mockNotify = jest.fn();

  const prestamosMock = [
    {
      id: 1,
      tituloLibro: '1984',
      codigoBarrasEjemplar: 'EJ-1984-001',
      nombreUsuario: 'Carlos Lector',
      emailUsuario: 'socio@biblioteca.cl',
      fechaInicio: '2026-11-25',
      fechaVencimiento: '2026-12-09',
      fechaDevolucionReal: null,
      estado: 'ACTIVO',
      diasRetraso: 0,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useStore.mockReturnValue({
      state: { prestamos: prestamosMock, loading: false },
      dispatch: mockDispatch,
      notify: mockNotify,
    });
  });

  test('llama a listarTodos y muestra acciones de préstamo/devolución para Bibliotecario', async () => {
    useAuth.mockReturnValue({ isBibliotecario: true });
    prestamosApi.listarTodos.mockResolvedValueOnce({ data: prestamosMock });

    render(<PrestamosPage />);

    await waitFor(() => {
      expect(prestamosApi.listarTodos).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('Control Global de Préstamos')).toBeInTheDocument();
    expect(screen.getByText('Nuevo Préstamo')).toBeInTheDocument();
    expect(screen.getByText('Devolver')).toBeInTheDocument();
    expect(screen.getByText('Carlos Lector')).toBeInTheDocument();
  });

  test('llama a listarMisPrestamos y oculta botones administrativos para Socio', async () => {
    useAuth.mockReturnValue({ isBibliotecario: false });
    prestamosApi.listarMisPrestamos.mockResolvedValueOnce({ data: prestamosMock });

    render(<PrestamosPage />);

    await waitFor(() => {
      expect(prestamosApi.listarMisPrestamos).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('Mis Préstamos')).toBeInTheDocument();
    expect(screen.queryByText('Nuevo Préstamo')).not.toBeInTheDocument();
    expect(screen.queryByText('Devolver')).not.toBeInTheDocument();
  });
});