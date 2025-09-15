import axios from 'axios'

console.log('API Base URL:', 'http://localhost:8000/api')

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
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
