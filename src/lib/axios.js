import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// CSRF interceptor
instance.interceptors.request.use(async (config) => {
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
        try {
            const { data } = await axios.get('http://localhost:5000/api/csrf-token', { withCredentials: true });
            config.headers['X-CSRF-Token'] = data.csrfToken;
        } catch (err) {
            console.error('Failed to fetch CSRF token', err);
        }
    }
    return config;
});

export default instance;
