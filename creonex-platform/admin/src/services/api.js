import axios from 'axios';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Create axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

console.log('Admin API Base URL:', api.defaults.baseURL);

// Resolves once Firebase has initialized and determined the auth state (logged in or not).
// This prevents the race condition where requests fire before auth.currentUser is populated.
let authReadyPromise = null;
const waitForAuthReady = () => {
    if (!authReadyPromise) {
        authReadyPromise = new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe(); // Only need to listen once
                resolve(user);
            });
        });
    }
    return authReadyPromise;
};

// Add request interceptor to attach Firebase auth token
api.interceptors.request.use(
    async (config) => {
        // Wait for Firebase auth to be ready before checking currentUser
        await waitForAuthReady();
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
            // Only redirect to login if the user WAS logged in (token genuinely expired/invalid).
            // If auth.currentUser is null, Firebase hasn't restored the session yet —
            // do NOT redirect or it causes an instant logout loop on page load.
            if (auth.currentUser) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
