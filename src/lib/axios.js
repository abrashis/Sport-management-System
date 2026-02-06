import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// CSRF interceptor
instance.interceptors.request.use(async (config) => {
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
        try {
            // Attempt to fetch CSRF token, but don't crash if backend is down/unreachable
            const csrfUrl = 'http://127.0.0.1:5000/api/csrf-token';
            // Use the same instance config for the CSRF request to ensure consistency
            const { data } = await axios.get(csrfUrl, { withCredentials: true, timeout: 5000 });
            if (data?.csrfToken) {
                config.headers['X-CSRF-Token'] = data.csrfToken;
            }
        } catch (err) {
            console.warn('Skipping CSRF token injection:', err.message);
            // Verify backend connectivity
        }
    }
    return config;
});

export default instance;
