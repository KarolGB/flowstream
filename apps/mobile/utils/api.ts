import axios from 'axios';
import { getItemAsync, setItemAsync } from 'expo-secure-store';

const api = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const API_URL = await getItemAsync('apiUrl') || undefined;
        api.defaults.baseURL = API_URL;
        const token = await getItemAsync('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401) {
            originalRequest._retry = true;
            try {
                const refreshToken = await getItemAsync('refreshToken');
                if (!refreshToken) {
                    return Promise.reject(error);
                }
                const reponse = await fetch(`${originalRequest.baseURL}/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refreshToken: refreshToken,
                    }),
                });
                const { accessToken, refreshToken: newRefreshToken } = await reponse.json();
                await setItemAsync('accessToken', accessToken);
                await setItemAsync('refreshToken', newRefreshToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (error) {
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;