import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { authApi } from '../api/authApi';
import { useAuth } from '../store/StoreContext';

jest.mock('../api/authApi', () => ({
  authApi: {
    login: jest.fn(),
  },
}));

jest.mock('../store/StoreContext', () => ({
  useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginPage', () => {
  const mockLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ loginSuccess: mockLoginSuccess });
  });

  test('autocompleta credenciales de socio al hacer clic en acceso rápido', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/socio@biblioteca.cl/i));

    expect(screen.getByDisplayValue('socio@biblioteca.cl')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Socio123!')).toBeInTheDocument();
  });

  test('inicia sesión exitosamente y redirige a /catalogo', async () => {
    const authPayload = {
      accessToken: 'jwt-token',
      refreshToken: 'ref-token',
      email: 'bibliotecario@biblioteca.cl',
      rol: 'ROLE_BIBLIOTECARIO',
    };
    authApi.login.mockResolvedValueOnce({ data: authPayload });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'bibliotecario@biblioteca.cl',
        password: 'Admin123!',
      });
      expect(mockLoginSuccess).toHaveBeenCalledWith(authPayload);
      expect(mockNavigate).toHaveBeenCalledWith('/catalogo');
    });
  });

  test('muestra alerta de error ante credenciales inválidas', async () => {
    authApi.login.mockRejectedValueOnce({
      response: { data: { message: 'Credenciales inválidas' } },
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
  });
});