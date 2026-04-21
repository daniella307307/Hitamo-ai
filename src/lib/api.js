// src/lib/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const publicRoutes = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
];
// ── Request interceptor: attach access token ──────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token && !publicRoutes.includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Response interceptor: auto-refresh on 401 ────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  )
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        )

        const { access_token, refresh_token } = data.data
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)

        api.defaults.headers.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)

        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Refresh failed — force logout
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api