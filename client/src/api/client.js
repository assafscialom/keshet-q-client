import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://qclient.iqdesk.xyz/server/api',
});

export default apiClient;
