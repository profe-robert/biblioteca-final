import axiosClient from './axiosClient';

export const librosApi = {
    listarLibros: () => axiosClient.get('/libros'),
    obtenerLibro: (id) => axiosClient.get(`/libros/${id}`),
    crearLibro: (libro) => axiosClient.post('/libros', libro),
    listarEjemplares: (libroId) => axiosClient.get(`/libros/${libroId}/ejemplares`),
    agregarEjemplar: (ejemplar) => axiosClient.post('/ejemplares', ejemplar),
};