import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api from "../utils/api";
import { useApi } from './ApiContext';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { apiUrl, isLoading: isApiLoading } = useApi();


    useEffect(() => {
        const checkAuth = async () => {
            if (isApiLoading) return;

            try {
                const response = await api.get(`${apiUrl}/user/me`);
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [apiUrl]);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post(`${apiUrl}/auth/login`, {
                email,
                password
            });
            const { access_token, refresh_token } = response.data;
            await setItemAsync('authToken', access_token);
            await setItemAsync('refreshToken', refresh_token);
            setIsAuthenticated(true);
        } catch (error: any) {
            setIsAuthenticated(false);
            return Promise.reject(error);
        }
    };

    const logout = async () => {
        try {
            const refresh_token = await getItemAsync('refreshToken');
            await api.post(`${apiUrl}/auth/logout`, { refresh_token });
            await deleteItemAsync('authToken');
            await deleteItemAsync('refreshToken');
            setIsAuthenticated(false);
        } catch (error) {
            setIsAuthenticated(false);
        }
    };


    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}