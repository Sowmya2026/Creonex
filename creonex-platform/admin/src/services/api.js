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
    timeout: 30000 // 30s timeout for stability on slow backend (Render spin-up)
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
    async (config) => {
        try {
            // Wait for Firebase to finish the initial session restoration
            // This is the most reliable way to avoid the "null user" on page load.
            if (typeof auth.authStateReady === 'function') {
                await auth.authStateReady();
            }

            const user = auth.currentUser;
            if (user) {
                // Force fresh token to ensure it's not expired
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
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            console.warn('API returned 401 Unauthorized');
            
            // If a user is currently logged in but received a 401, 
            // it means their token is invalid or they lack permissions.
            // We sign out to trigger the app's redirection logic safely.
            if (auth.currentUser) {
                try {
                    console.error('Active session rejected by server. Signing out...');
                    await signOut(auth);
                    // No need for window.location.href - AuthContext will detect the 
                    // sign out and RequireAuth will redirect to /login.
                } catch (logoutError) {
                    console.error('Logout failed:', logoutError);
                    window.location.href = '/login'; // Fallback
                }
            }
        }
        
        // Detailed error logging for production debugging
        if (error.code === 'ECONNABORTED') {
            console.error('Request timed out. The server might be starting up.');
        }

        return Promise.reject(error);
    }
);

export default api;
