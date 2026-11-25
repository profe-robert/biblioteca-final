import axiosClient from './axiosClient';

export const authApi = {
    login: (credentials) => axiosClient.post('/auth/login', credentials),
    refresh: (refreshToken) => axiosClient.post('/auth/refresh', { refreshToken }),
    logout: (refreshToken) => axiosClient.post('/auth/logout', { refreshToken }),
};