import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true
});

// CSRF Interceptor
api.interceptors.request.use(async (config) => {
    // Methods that need CSRF
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
        // Fetch token if not already present in memory (you could also store it in a global variable)
        try {
            const response = await axios.get(`${api.defaults.baseURL}/csrf-token`, { withCredentials: true });
            config.headers['X-CSRF-Token'] = response.data.csrfToken;
        } catch (err) {
            console.error("Failed to fetch CSRF token", err);
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
