import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EjemplarModal from './EjemplarModal';
import { librosApi } from '../../api/librosApi';
import { useStore } from '../../store/StoreContext';

jest.mock('../../api/librosApi', () => ({
  librosApi: {
    agregarEjemplar: jest.fn(),
  },
}));

jest.mock('../../store/StoreContext', () => ({
  useStore: jest.fn(),
}));

describe('EjemplarModal', () => {
  const mockNotify = jest.fn();
  const mockOnHide = jest.fn();
  const mockOnCreated = jest.fn();
  const libroMock = { id: 10, titulo: 'Clean Code' };

  beforeEach(() => {
    jest.clearAllMocks();
    useStore.mockReturnValue({ notify: mockNotify });
  });

  test('muestra el título del libro y registra un ejemplar físico', async () => {
    librosApi.agregarEjemplar.mockResolvedValueOnce({ data: { id: 99 } });

    render(
      <EjemplarModal
        show={true}
        onHide={mockOnHide}
        libro={libroMock}
        onCreated={mockOnCreated}
      />
    );

    expect(screen.getByText('Clean Code')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Ej: EJ-QUIJ-003'), {
      target: { value: 'EJ-CLN-003' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ej: Pasillo A - Estante 2'), {
      target: { value: 'Pasillo T - Estante 5' },
    });

    fireEvent.click(screen.getByText('Agregar Copia'));

    await waitFor(() => {
      expect(librosApi.agregarEjemplar).toHaveBeenCalledWith({
        libroId: 10,
        codigoBarras: 'EJ-CLN-003',
        ubicacion: 'Pasillo T - Estante 5',
      });
      expect(mockNotify).toHaveBeenCalledWith('success', expect.stringContaining('EJ-CLN-003'));
      expect(mockOnCreated).toHaveBeenCalledTimes(1);
      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
  });
});