import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v2',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('accessToken')
  if (token) cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` }
  return cfg
})

export default api
