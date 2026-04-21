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
    timeout: 60000 // 60s timeout - essential for Render.com free tier cold starts
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
    async (config) => {
        try {
            // Only block if Firebase is still in the "initializing" phase.
            // If currentUser is already set, or authStateReady has already resolved, 
            // we proceed immediately.
            if (!auth.currentUser && typeof auth.authStateReady === 'function') {
                // Wait for initial session restoration (max 5s wait for auth specifically)
                await Promise.race([
                    auth.authStateReady(),
                    new Promise(resolve => setTimeout(resolve, 5000))
                ]);
            }

            const user = auth.currentUser;
            if (user) {
                // Use cached token if available, fresh if needed
                const token = await user.getIdToken(false);
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('API Request Auth Error:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;

        // Auto-retry on timeouts (Cold Start handling)
        if ((error.code === 'ECONNABORTED' || error.message?.includes('timeout')) && !config._retry) {
            config._retryCount = (config._retryCount || 0) + 1;
            
            if (config._retryCount <= 2) {
                console.log(`🔄 Retrying request (${config._retryCount}/2): ${config.url}`);
                // Wait 2s before retry to give server more boot time
                await new Promise(resolve => setTimeout(resolve, 2000));
                return api(config);
            }
        }

        // Handle 401 Unauthorized errors
        if (response?.status === 401) {
            console.warn('API returned 401 Unauthorized');
            
            if (auth.currentUser) {
                try {
                    console.error('Active session rejected by server. Signing out...');
                    await signOut(auth);
                } catch (logoutError) {
                    console.error('Logout failed:', logoutError);
                    window.location.href = '/login'; // Fallback
                }
            }
        }
        
        // Detailed error logging for production debugging
        if (error.code === 'ECONNABORTED') {
            console.error('Request timed out after second retry. The server is still starting up or under heavy load.');
        }

        return Promise.reject(error);
    }
);

export default api;
