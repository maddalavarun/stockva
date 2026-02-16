import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message;
        if (message === 'Subject must be a string') {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const setupAdmin = (data) => api.post('/auth/setup-admin', data);

// Admin
export const createStaff = (data) => api.post('/admin/create-staff', data);
export const addProduct = (data) => api.post('/admin/add-product', data);
export const getStaffList = () => api.get('/admin/staff');
export const getAdminSummary = () => api.get('/admin/dashboard-summary');

// Staff
export const addStock = (data) => api.post('/staff/add-stock', data);
export const bulkAddStock = (data) => api.post('/staff/bulk-add-stock', data);

// Common
export const getProducts = () => api.get('/common/products');
export const getHistory = (search = '', date = '') => api.get(`/common/history?search=${search}&date=${date}`);
export const getStockSummary = () => api.get('/common/stock-summary');

export default api;
