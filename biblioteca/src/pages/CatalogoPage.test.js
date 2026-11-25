import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CatalogoPage from './CatalogoPage';
import { librosApi } from '../api/librosApi';
import { useAuth, useStore } from '../store/StoreContext';

jest.mock('../api/librosApi', () => ({
  librosApi: {
    listarLibros: jest.fn(),
  },
}));

jest.mock('../store/StoreContext', () => ({
  useAuth: jest.fn(),
  useStore: jest.fn(),
}));

describe('CatalogoPage', () => {
  const mockDispatch = jest.fn();
  const mockNotify = jest.fn();

  const librosMock = [
    {
      id: 1,
      isbn: '978-0451524935',
      titulo: '1984',
      autor: 'George Orwell',
      anioPublicacion: 1949,
      categoria: 'Distopía',
      ejemplaresDisponibles: 1,
      ejemplares: [
        { id: 10, codigoBarras: 'EJ-1984-001', ubicacion: 'Pasillo C', estado: 'DISPONIBLE' },
      ],
    },
    {
      id: 2,
      isbn: '978-0132350884',
      titulo: 'Clean Code',
      autor: 'Robert C. Martin',
      anioPublicacion: 2008,
      categoria: 'Software',
      ejemplaresDisponibles: 2,
      ejemplares: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    librosApi.listarLibros.mockResolvedValue({ data: librosMock });
    useStore.mockReturnValue({
      state: { libros: librosMock, loading: false },
      dispatch: mockDispatch,
      notify: mockNotify,
    });
  });

  test('muestra botones de gestión solo para Bibliotecario y filtra por búsqueda', async () => {
    useAuth.mockReturnValue({ isBibliotecario: true });

    render(<CatalogoPage />);

    await waitFor(() => {
      expect(librosApi.listarLibros).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('Nuevo Libro')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
    expect(screen.getByText('Clean Code')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Buscar por título, autor o ISBN...'), {
      target: { value: 'Orwell' },
    });

    expect(screen.getByText('1984')).toBeInTheDocument();
    expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
  });

  test('oculta acciones de creación para rol Socio', () => {
    useAuth.mockReturnValue({ isBibliotecario: false });

    render(<CatalogoPage />);

    expect(screen.queryByText('Nuevo Libro')).not.toBeInTheDocument();
    expect(screen.queryByText('Agregar Ejemplar')).not.toBeInTheDocument();
  });
});