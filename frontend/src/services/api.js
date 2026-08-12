import axios from 'axios'

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const baseURL = import.meta.env.VITE_API_URL ? `${BACKEND_URL}/api` : '/api'

const api = axios.create({
  baseURL,
})

export function getAssetUrl(path) {
  if (!path) return null
  if (typeof path !== 'string') return null
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/')) {
    return `${BACKEND_URL}${path}`
  }
  return `${BACKEND_URL}/${path}`
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pos_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
