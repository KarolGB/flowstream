import { deleteItemAsync, setItemAsync } from "expo-secure-store";
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
    const { apiUrl } = useApi();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get(`${apiUrl}/auth/me`);
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
            const { authToken, refreshToken } = response.data;
            await setItemAsync('authToken', authToken);
            await setItemAsync('refreshToken', refreshToken);
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
        }
    };

    const logout = async () => {
        try {
            await api.post(`${apiUrl}/auth/logout`);
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