// src/lib/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/signup',
  '/auth/password-reset/request',
  '/auth/password-reset/confirm',
]

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')

  if (token && config.url && !publicRoutes.includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let isRefreshing = false
let failedQueue = []

const getTokenPair = (payload) => {
  const tokenSource = payload?.data?.tokens ?? payload?.data ?? payload?.tokens ?? payload

  return {
    accessToken: tokenSource?.accessToken ?? tokenSource?.access_token ?? null,
    refreshToken: tokenSource?.refreshToken ?? tokenSource?.refresh_token ?? null,
  }
}

const processQueue = (error, token = null) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error)
      return
    }

    request.resolve(token)
  })

  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const requestUrl = original?.url

    if (!original || status !== 401) {
      return Promise.reject(error)
    }

    if (requestUrl && publicRoutes.includes(requestUrl)) {
      return Promise.reject(error)
    }

    if (original._retry) {
      localStorage.clear()
      // window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
        .catch((queueError) => Promise.reject(queueError))
    }

    original._retry = true
    isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        throw error
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        { refreshToken }
      )

      const { accessToken, refreshToken: nextRefreshToken } = getTokenPair(data)

      if (!accessToken || !nextRefreshToken) {
        throw error
      }

      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', nextRefreshToken)

      api.defaults.headers.Authorization = `Bearer ${accessToken}`
      processQueue(null, accessToken)

      original.headers.Authorization = `Bearer ${accessToken}`
      return api(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.clear()
      // window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
