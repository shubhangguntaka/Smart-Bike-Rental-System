import axios from "axios";
import env from "../config/env";
import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: env.API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url === "/auth/refresh-token" ||
        originalRequest.url === "/auth/login"
      ) {
        storage.removeToken();
        storage.removeUser();
        storage.removeRole();
        storage.removeRefreshToken();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const res = await axios.post(`${env.API_BASE_URL}/auth/refresh-token`, {
          refreshToken: refreshToken,
        });

        const data = res.data?.data || res.data;
        const newAccessToken = data?.accessToken;
        if (!newAccessToken) {
          throw new Error("No access token returned from refresh endpoint");
        }

        storage.setToken(newAccessToken);
        if (data.refreshToken) {
          storage.setRefreshToken(data.refreshToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.removeToken();
        storage.removeUser();
        storage.removeRole();
        storage.removeRefreshToken();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      console.warn("API 403 Forbidden Response:", error.config?.url);
    }

    return Promise.reject(error);
  }
);

export default api;