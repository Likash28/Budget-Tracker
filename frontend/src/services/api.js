import axios from 'axios'

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = 'https://budget-tracker-je3p.onrender.com/api'

console.log('API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL
})

export function setToken(token){
  if (token) {
    localStorage.setItem('jwt', token)
    api.defaults.headers.common['Authorization'] = 'Bearer ' + token
  } else {
    localStorage.removeItem('jwt')
    delete api.defaults.headers.common['Authorization']
  }
}
export function getToken(){
  const token = localStorage.getItem('jwt')
  if (token) setToken(token)
  return token
}

export default api