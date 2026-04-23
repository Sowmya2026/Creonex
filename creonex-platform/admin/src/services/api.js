import axios from 'axios';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

// ----------------------------------------------------------------------
// API Service for Admin Portal
// Features: 
// 1. Automatic Firebase ID Token attachment
// 2. Auth-state synchronization (avoids race conditions)
// 3. Graceful session expiration handling
// ----------------------------------------------------------------------

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 60000 
});

// Cache for in-flight requests (Request Deduping)
const pendingRequests = new Map();

// Request interceptor
api.interceptors.request.use(
    async (config) => {
        // Create unique key for the request (Method + URL + Params)
        const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
        
        // If an identical request is already in progress, wait for it
        if (pendingRequests.has(requestKey) && config.method?.toLowerCase() === 'get') {
            return pendingRequests.get(requestKey).then(response => {
                // Return a "fake" successful promise that looks like a real Axios response
                // but actually comes from the existing in-flight request.
                // Note: Axios interceptors expect the config to be returned if we want to proceed,
                // but here we actually want to BLOCK the second request and return the first one's result.
                // Since Axios doesn't support returning a response directly from a request interceptor,
                // we'll handle this by attaching a special property.
                config.adapter = () => pendingRequests.get(requestKey);
            });
        }

        try {
            if (!auth.currentUser && typeof auth.authStateReady === 'function') {
                await Promise.race([
                    auth.authStateReady(),
                    new Promise(resolve => setTimeout(resolve, 5000))
                ]);
            }

            const user = auth.currentUser;
            if (user) {
                const token = await Promise.race([
                    user.getIdToken(false),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Token timeout')), 10000))
                ]);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            console.error('API Request Auth/Token Error:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        const requestKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params || {})}`;
        pendingRequests.delete(requestKey);
        return response;
    },
    async (error) => {
        const { config, response } = error;
        const requestKey = config ? `${config.method}:${config.url}:${JSON.stringify(config.params || {})}` : null;
        if (requestKey) pendingRequests.delete(requestKey);

        const isNetworkError = !response && error.code !== 'ECONNABORTED';
        const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');

        if ((isNetworkError || isTimeout) && (!config || !config._retry)) {
            config._retryCount = (config._retryCount || 0) + 1;
            
            if (config._retryCount <= 2) {
                console.log(`🔄 Retrying due to ${isTimeout ? 'timeout' : 'network error'} (${config._retryCount}/2): ${config.url}`);
                const delay = config._retryCount === 1 ? 1000 : 3000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return api(config);
            }
        }

        if (response?.status === 401 && auth.currentUser && !config._retryAuth) {
            config._retryAuth = true;
            try {
                // Force refresh the Firebase token
                console.log('🔄 Token likely expired, refreshing session...');
                const token = await auth.currentUser.getIdToken(true);
                config.headers.Authorization = `Bearer ${token}`;
                return api(config); // Retry original request with new token
            } catch (refreshError) {
                console.error('❌ Session refresh failed. Signing out...', refreshError);
                await signOut(auth);
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
