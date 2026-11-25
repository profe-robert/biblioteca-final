import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DevolucionModal from './DevolucionModal';
import { prestamosApi } from '../../api/prestamosApi';
import { useStore } from '../../store/StoreContext';

jest.mock('../../api/prestamosApi', () => ({
  prestamosApi: {
    registrarDevolucion: jest.fn(),
  },
}));

jest.mock('../../store/StoreContext', () => ({
  useStore: jest.fn(),
}));

describe('DevolucionModal', () => {
  const mockNotify = jest.fn();
  const mockOnHide = jest.fn();
  const mockOnCompleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useStore.mockReturnValue({ notify: mockNotify });
  });

  test('envía el código de barras y confirma la devolución', async () => {
    prestamosApi.registrarDevolucion.mockResolvedValueOnce({ data: { id: 1 } });

    render(
      <DevolucionModal
        show={true}
        onHide={mockOnHide}
        codigoBarrasInicial="EJ-1984-001"
        onCompleted={mockOnCompleted}
      />
    );

    fireEvent.click(screen.getByText('Confirmar Devolución'));

    await waitFor(() => {
      expect(prestamosApi.registrarDevolucion).toHaveBeenCalledWith('EJ-1984-001');
      expect(mockNotify).toHaveBeenCalledWith('success', expect.stringContaining('EJ-1984-001'));
      expect(mockOnCompleted).toHaveBeenCalledTimes(1);
      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
  });
});