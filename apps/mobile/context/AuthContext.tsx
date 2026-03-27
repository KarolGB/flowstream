import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import apiClient from '../api/client';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { DeviceEventEmitter } from 'react-native';

interface AuthContextType {
  isAuthenticated: boolean | null;
  setIsAuthenticated: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  hasUrl: boolean | null;
  setHasUrl: (value: boolean) => void;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteUrl: () => Promise<void>;
  saveUrl: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  setIsAuthenticated: () => {},
  isLoading: true,
  setIsLoading: () => {},
  hasUrl: null,
  setHasUrl: () => {},
  login: async () => {},
  logout: async () => {},
  deleteUrl: async () => {},
  saveUrl: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading,setIsLoading] = useState(true)
    const [hasUrl, setHasUrl] = useState<boolean | null>(null);
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const url = await SecureStore.getItemAsync('baseUrl');
                setHasUrl(!!url);
                const response = await apiClient.get("/auth/me")
                setIsAuthenticated(true);
            } catch (e) {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('onSessionExpired', () => {
            console.log("Contexto enterado: La sesión caducó en Axios. Expulsando...");
            setIsAuthenticated(false);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const saveUrl = async (url: string) => {
        await SecureStore.setItemAsync('baseUrl', url);
        setHasUrl(true);
    }

    const login = async (identifier:string, password:string) => {
        try{
            const baseUrl = await SecureStore.getItemAsync('baseUrl');
            const response = await axios.post(`${baseUrl}/auth/login`,{identifier,password})
            let access_token = response.data.access_token
            let refresh_token = response.data.refresh_token
            if (!access_token || !refresh_token){
                throw new Error("Invalid credentials")
            }
            await SecureStore.setItemAsync('access_token', access_token);
            await SecureStore.setItemAsync('refresh_token', refresh_token);
            setIsAuthenticated(true)
            return
        }catch(error: any){
            const errorMessage = error.response?.data?.detail || error.message;
            throw error
        }
    }

    const logout = async () => {
        const baseUrl = await SecureStore.getItemAsync('baseUrl');
        const refresh_token = await SecureStore.getItemAsync('refresh_token');
        await axios.post(`${baseUrl}/auth/logout`,{refresh_token})
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        setIsAuthenticated(false);
    }

    const deleteUrl = async () => {
        await SecureStore.deleteItemAsync('baseUrl');
        setHasUrl(false);
    }



    return (
        <AuthContext.Provider value={{isAuthenticated,setIsAuthenticated,isLoading,setIsLoading,hasUrl, setHasUrl,login,logout,deleteUrl,saveUrl}}>
            {children}
        </AuthContext.Provider>
        
    )
}