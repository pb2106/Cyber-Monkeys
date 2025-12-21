import axios from 'axios';

// Determine the API base URL
// If accessed via Cloudflare tunnel, connect directly to backend
// Otherwise use Vite proxy
const getBaseURL = () => {
    const hostname = window.location.hostname;
    if (hostname.includes('trycloudflare.com')) {
        // Accessed via Cloudflare tunnel - connect directly to backend
        return 'http://localhost:8000/api';
    }
    // Local development - use Vite proxy
    return '/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});


// Add authorization header if token exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/mock-verifier/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
