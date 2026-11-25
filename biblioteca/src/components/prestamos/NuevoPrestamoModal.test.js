import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NuevoPrestamoModal from './NuevoPrestamoModal';
import { prestamosApi } from '../../api/prestamosApi';
import { useStore } from '../../store/StoreContext';

jest.mock('../../api/prestamosApi', () => ({
  prestamosApi: {
    registrarPrestamo: jest.fn(),
  },
}));

jest.mock('../../store/StoreContext', () => ({
  useStore: jest.fn(),
}));

describe('NuevoPrestamoModal', () => {
  const mockNotify = jest.fn();
  const mockOnHide = jest.fn();
  const mockOnCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useStore.mockReturnValue({ notify: mockNotify });
  });

  test('precarga el código de barras inicial y registra el préstamo', async () => {
    prestamosApi.registrarPrestamo.mockResolvedValueOnce({ data: { id: 1 } });

    render(
      <NuevoPrestamoModal
        show={true}
        onHide={mockOnHide}
        codigoBarrasInicial="EJ-1984-001"
        onCreated={mockOnCreated}
      />
    );

    const inputCodigo = screen.getByPlaceholderText('Ej: EJ-1984-001');
    expect(inputCodigo.value).toBe('EJ-1984-001');

    fireEvent.click(screen.getByText('Confirmar Préstamo'));

    await waitFor(() => {
      expect(prestamosApi.registrarPrestamo).toHaveBeenCalledWith({
        usuarioId: 2,
        codigoBarras: 'EJ-1984-001',
        diasPrestamo: 14,
      });
      expect(mockNotify).toHaveBeenCalledWith('success', expect.stringContaining('EJ-1984-001'));
      expect(mockOnCreated).toHaveBeenCalledTimes(1);
      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
  });
});