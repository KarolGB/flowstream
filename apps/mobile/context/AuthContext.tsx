import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import apiClient from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean | null;
  setIsAuthenticated: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  setIsAuthenticated: () => {},
  isLoading: true,
  setIsLoading: () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading,setIsLoading] = useState(true)
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await apiClient.get("auth/me")
                if (response.status === 200){
                    setIsAuthenticated(true);
                }
                else {
                    setIsAuthenticated(false);
                }
            } catch (e) {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);


    return (
        <AuthContext.Provider value={{isAuthenticated,setIsAuthenticated,isLoading,setIsLoading}}>
            {children}
        </AuthContext.Provider>
        
    )
}