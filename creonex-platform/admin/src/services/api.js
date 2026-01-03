import axios from 'axios';
import { auth } from '../config/firebase';

// Create axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

console.log('Admin API Base URL:', api.defaults.baseURL);

// Add request interceptor to attach Firebase auth token
api.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
