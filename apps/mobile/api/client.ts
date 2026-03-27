import axios from "axios"
import * as SecureStore from 'expo-secure-store';
import { DeviceEventEmitter } from 'react-native'

const apiClient = axios.create({
    timeout:1000,
    headers: {
        "Content-Type": "application/json"
    }
})


apiClient.interceptors.request.use(
    async (config) => {
        const baseUrl = await SecureStore.getItemAsync('baseUrl')
        if (baseUrl) {
            config.baseURL = baseUrl
        }
        const access_token = await SecureStore.getItemAsync('access_token')
        if (access_token){
            config.headers.Authorization = `Bearer ${access_token}`
        }
        return config
})

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try{
                const refresh_token = await SecureStore.getItemAsync('refresh_token')
                const baseUrl = await SecureStore.getItemAsync('baseUrl')
                if (!refresh_token || !baseUrl) {
                    return Promise.reject(error)
                }
                const response = await axios.post(`${baseUrl}/auth/refresh`, { refresh_token })
                if (response.status !== 200){
                    return Promise.reject(error)
                }
                const accessToken = response.data.access_token
                await SecureStore.setItemAsync('access_token', accessToken)
                const refreshToken = response.data.refresh_token
                await SecureStore.setItemAsync('refresh_token', refreshToken)
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return apiClient(originalRequest)
            }catch{
                await SecureStore.deleteItemAsync('access_token')
                await SecureStore.deleteItemAsync('refresh_token')
                DeviceEventEmitter.emit('onSessionExpired');
            }
        }
        return Promise.reject(error)
    }
)

export default apiClient;