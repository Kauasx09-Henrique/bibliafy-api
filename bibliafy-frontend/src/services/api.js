import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333', // A URL base do seu backend
});

export default api;