import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://qserver.keshet-teamim.co.il/api',
});

export default apiClient;
