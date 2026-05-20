import axios from "axios";

/**
 * =========================
 * Axios Instance (API Client)
 * =========================
 * Central place for all API requests.
 * Keeps baseURL and headers consistent.
 */
const api = axios.create({
  baseURL: "http://localhost:8000/api", // 👈 all requests go to backend /api of FastAPI
  headers: {
    "Content-Type": "application/json", // this tells the backend that we are sending JSON data in the request body or in format
  },
});

/**
 * =========================
 * Request Interceptor
 * =========================
 * Runs BEFORE every request.
 * Automatically attaches JWT token if available.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); //check if token exists in localStorage

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // 👆 attach token to every request for authentication
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * =========================
 * Response Interceptor
 * =========================
 * Runs AFTER every response.
 * Handles global errors like unauthorized access.
 */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    // Token expired or invalid
    // on the login page -> 401 is passed to catch block and toast shows
    // on other pages-> 401 means token expired-> redirects to login
    if (status === 401 && !window.location.pathname.includes("/login")) {
      clearAuth(); // logout user
      window.location.href = "/login"; // redirect to login
    }

    return Promise.reject(error);
  },
);

/**
 * =========================
 * AUTH HELPERS (Named Exports)
 * =========================
 * Reusable authentication utilities
 */

/** Get and token from storage */
export const getToken = () => {
  return localStorage.getItem("token");
};

/** Get and user from storage. */
// 👉 This function reads the logged-in user from browser storage (localStorage) and returns it as a JavaScript object.
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/** Check if user is logged in */
export const isLoggedIn = () => {
  return !!getToken();
};

/** Save login data after authentication and saves token and user to localStorage */
export const saveAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

/** Clear auth data (logout) */
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * =========================
 * DEFAULT EXPORT
 * =========================
 */
export default api;
