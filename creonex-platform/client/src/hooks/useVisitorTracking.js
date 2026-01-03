import { useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook to track visitor activity
 * Automatically tracks page views and visitor sessions
 */
const useVisitorTracking = () => {
    useEffect(() => {
        const trackVisitor = async () => {
            try {
                const userAgent = navigator.userAgent;
                const page = window.location.pathname;

                await api.post('/visitors/track', {
                    userAgent,
                    page
                });

                console.log('Visitor tracked successfully');
            } catch (error) {
                console.error('Failed to track visitor:', error);
            }
        };

        // Track on mount
        trackVisitor();

        // Track on route change (for single page apps)
        const handleRouteChange = () => {
            trackVisitor();
        };

        // Listen for popstate events (browser back/forward)
        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, []);
};

export default useVisitorTracking;
