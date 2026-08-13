import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginAdmin = async (username, password) => {
  const response = await api.post('/login', { username, password });
  return response.data;
};

export const createOfficer = async (officerData) => {
  const response = await api.post('/officers', officerData);
  return response.data;
};

export const fetchOfficers = async () => {
  const response = await api.get('/officers');
  return response.data;
};

export const analyzeGrievance = async (text, language = 'Auto Detect', category = 'Auto Detect') => {
  const response = await api.post('/analyze', { text, language, category });
  return response.data;
};

export const submitGrievance = async (grievanceData) => {
  const response = await api.post('/grievances', grievanceData);
  return response.data;
};

export const getGrievanceByTicket = async (ticketId) => {
  const response = await api.get(`/grievances/${ticketId}`);
  return response.data;
};

export const fetchGrievances = async (params = {}) => {
  const response = await api.get('/grievances', { params });
  return response.data;
};

export const updateStatus = async (ticketId, status, comment = '') => {
  const response = await api.put(`/grievances/${ticketId}/status`, { status, comment });
  return response.data;
};

export const submitFeedback = async (ticketId, rating, feedback_comment = '') => {
  const response = await api.post(`/grievances/${ticketId}/feedback`, { rating, feedback_comment });
  return response.data;
};

export const fetchDashboardStats = async (state = 'All', city = 'All') => {
  const params = {};
  if (state && state !== 'All') params.state = state;
  if (city && city !== 'All') params.city = city;
  const response = await api.get('/dashboard', { params });
  return response.data;
};

export const CSV_EXPORT_URL = `${API_BASE_URL}/grievances/export/csv`;

export default api;
