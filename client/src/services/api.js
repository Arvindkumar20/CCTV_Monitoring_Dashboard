// import axios from "axios";

// const api = axios.create({
//   baseURL:
//     import.meta.env.VITE_APP_API_URL ||
//     // "http://localhost:5000",
//     "https://cctv-monitoring-dashboard-server.onrender.com",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // 🔒 Global refresh control
// let isRefreshing = false;
// let refreshAttempts = 0;
// const MAX_REFRESH_ATTEMPTS = 2;

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
//         // ❌ Stop trying after 2 attempts
//         window.location.href = "/admin-login";
//         console.log(error);
//         return Promise.reject(error);
//       }

//       if (isRefreshing) {
//         console.log(error);
//         return Promise.reject(error);
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;
//       refreshAttempts++;

//       try {
//         await api.post("/api/auth/refresh-token");

//         // ✅ Reset attempts on success
//         refreshAttempts = 0;
//         isRefreshing = false;

//         return api(originalRequest);
//       } catch (refreshError) {
//         console.log(refreshError);
//         isRefreshing = false;

//         if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
//           window.location.href = "/admin-login";
//         }

//         return Promise.reject(refreshError);
//       }
//     }
//     console.log(error);
//     return Promise.reject(error);
//   },
// );

// export default api;




// frontend/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_URL ||
    "https://cctv-monitoring-dashboard-server.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    
  },
});

// ═══════════════════════════════════════════════════════════
// ✅ TOKEN STORE — global access
// ═══════════════════════════════════════════════════════════
let _accessToken = null;
let _tokenListeners = new Set();

export const tokenStore = {
  get: () => _accessToken,
  set: (token) => {
    _accessToken = token;
    // Notify all listeners (e.g., AuthContext)
    _tokenListeners.forEach((fn) => fn(token));
  },
  clear: () => {
    _accessToken = null;
    _tokenListeners.forEach((fn) => fn(null));
  },
  subscribe: (fn) => {
    _tokenListeners.add(fn);
    return () => _tokenListeners.delete(fn);
  },
};

// ═══════════════════════════════════════════════════════════
// ✅ REQUEST interceptor — attach Bearer token (optional)
// ═══════════════════════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ═══════════════════════════════════════════════════════════
// ✅ RESPONSE interceptor — capture token + refresh logic
// ═══════════════════════════════════════════════════════════
let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;

api.interceptors.response.use(
  (response) => {
    // ✅ Auto-capture token from login/refresh responses
    const newToken =
      response.data?.data?.accessToken ||
      response.data?.accessToken ||
      null;

    if (newToken) {
      tokenStore.set(newToken);
      console.log("🔑 Token captured from response");
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        window.location.href = "/admin-login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttempts++;

      try {
        await api.post("/api/auth/refresh-token");
        refreshAttempts = 0;
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
          tokenStore.clear();
          window.location.href = "/admin-login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;