import axios from 'axios';

const BASE_URL = 'http://localhost:8085/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export function setupInterceptors({ onTokenRefreshed, onAuthFailure }) {
  // Limpia interceptores previos en caso de hot-reload
  axiosClient.interceptors.request.clear();
  axiosClient.interceptors.response.clear();

  // Request Interceptor: adjunta el Access Token JWT
  axiosClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('biblioteca_access_token');
      if (token && !config.url.includes('/auth/login') && !config.url.includes('/auth/refresh')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: captura 401 y refresca el Access Token automáticamente
  axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes('/auth/login') &&
        !originalRequest.url.includes('/auth/refresh')
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axiosClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('biblioteca_refresh_token');
        if (!refreshToken) {
          isRefreshing = false;
          onAuthFailure();
          return Promise.reject(error);
        }

        try {
          // Usamos axios puro para evitar bucle infinito en el interceptor
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          onTokenRefreshed({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });

          processQueue(null, data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          onAuthFailure();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}

export default axiosClient;