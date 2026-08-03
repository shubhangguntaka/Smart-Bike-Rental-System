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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.removeToken();
      storage.removeUser();
      storage.removeRole();
      storage.removeRefreshToken();
      window.location.href = "/login";
    }
    if (error.response?.status === 403) {
      window.location.href = "/unauthorized";
    }
    return Promise.reject(error);
  }
);

export default api;