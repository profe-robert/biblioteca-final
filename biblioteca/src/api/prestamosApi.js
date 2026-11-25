import axiosClient from './axiosClient';

export const prestamosApi = {
    listarTodos: () => axiosClient.get('/prestamos'),
    listarMisPrestamos: () => axiosClient.get('/prestamos/mis-prestamos'),
    registrarPrestamo: (datos) => axiosClient.post('/prestamos', datos),
    registrarDevolucion: (codigoBarras) => axiosClient.post('/prestamos/devolucion', { codigoBarras }),
};