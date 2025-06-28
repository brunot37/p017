import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      console.log('Token inválido ou expirado, fazendo logout...')
      localStorage.removeItem('token')
      localStorage.removeItem('userType')
      localStorage.removeItem('userName')

      if (window.location.pathname !== '/' && window.location.pathname !== '/Login') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
