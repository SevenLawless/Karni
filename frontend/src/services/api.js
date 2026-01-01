import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const transactionAPI = {
  getAll: (filters = {}) => {
    return api.get('/transactions', { params: filters });
  },
  
  getById: (id) => {
    return api.get(`/transactions/${id}`);
  },
  
  create: (transaction) => {
    return api.post('/transactions', transaction);
  },
  
  update: (id, transaction) => {
    return api.put(`/transactions/${id}`, transaction);
  },
  
  delete: (id) => {
    return api.delete(`/transactions/${id}`);
  },
  
  getBalances: () => {
    return api.get('/transactions/balances');
  },
  
  getMonthlySummary: () => {
    return api.get('/transactions/summary/monthly');
  },
  
  exportCSV: () => {
    return api.get('/transactions/export/csv', {
      responseType: 'blob'
    });
  }
};

export default api;

