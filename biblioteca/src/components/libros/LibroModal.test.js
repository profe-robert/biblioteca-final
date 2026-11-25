import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LibroModal from './LibroModal';
import { librosApi } from '../../api/librosApi';
import { useStore } from '../../store/StoreContext';

jest.mock('../../api/librosApi', () => ({
  librosApi: {
    crearLibro: jest.fn(),
  },
}));

jest.mock('../../store/StoreContext', () => ({
  useStore: jest.fn(),
}));

describe('LibroModal', () => {
  const mockNotify = jest.fn();
  const mockOnHide = jest.fn();
  const mockOnCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useStore.mockReturnValue({ notify: mockNotify });
  });

  test('envía el formulario y crea un libro correctamente', async () => {
    librosApi.crearLibro.mockResolvedValueOnce({ data: { id: 1 } });

    render(<LibroModal show={true} onHide={mockOnHide} onCreated={mockOnCreated} />);

    fireEvent.change(screen.getByPlaceholderText('Ej: 978-8420412146'), {
      target: { value: '978-9561111111' },
    });
    fireEvent.change(screen.getByPlaceholderText('Título de la obra'), {
      target: { value: 'Papelucho' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nombre del autor'), {
      target: { value: 'Marcela Paz' },
    });

    fireEvent.click(screen.getByText('Guardar Libro'));

    await waitFor(() => {
      expect(librosApi.crearLibro).toHaveBeenCalledWith(
        expect.objectContaining({
          isbn: '978-9561111111',
          titulo: 'Papelucho',
          autor: 'Marcela Paz',
        })
      );
      expect(mockNotify).toHaveBeenCalledWith('success', expect.any(String));
      expect(mockOnCreated).toHaveBeenCalledTimes(1);
      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
  });

  test('muestra notificación de error cuando la API falla', async () => {
    librosApi.crearLibro.mockRejectedValueOnce({
      response: { data: { message: 'ISBN duplicado' } },
    });

    render(<LibroModal show={true} onHide={mockOnHide} onCreated={mockOnCreated} />);

    fireEvent.change(screen.getByPlaceholderText('Ej: 978-8420412146'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Título de la obra'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Nombre del autor'), { target: { value: 'Autor' } });

    fireEvent.click(screen.getByText('Guardar Libro'));

    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith('danger', 'ISBN duplicado');
      expect(mockOnHide).not.toHaveBeenCalled();
    });
  });
});