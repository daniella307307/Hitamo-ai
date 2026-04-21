// src/lib/integrationApi.js
import axios from 'axios'

const integrationApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': import.meta.env.VITE_INTEGRATION_API_KEY,
  },
})

export default integrationApi