import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_URL ||
    // "http://localhost:5000",
    "https://cctv-monitoring-dashboard-server.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔒 Global refresh control
let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        // ❌ Stop trying after 2 attempts
        window.location.href = "/admin-login";
        console.log(error);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        console.log(error);
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttempts++;

      try {
        await api.post("/api/auth/refresh-token");

        // ✅ Reset attempts on success
        refreshAttempts = 0;
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        console.log(refreshError);
        isRefreshing = false;

        if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
          window.location.href = "/admin-login";
        }

        return Promise.reject(refreshError);
      }
    }
    console.log(error);
    return Promise.reject(error);
  },
);

export default api;
