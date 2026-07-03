import { getItemAsync, setItemAsync } from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface ApiContextType {
    apiUrl: string | null;
    isLoading: boolean;
    setApiUrl: (url: string) => void;
    updateApiUrl: (url: string) => Promise<string | void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider = ({ children }: { children: ReactNode }) => {
    const [apiUrl, setApiUrl] = useState<null | string>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchApiUrl = async () => {
            const storedApiUrl = await getItemAsync('apiUrl');
            if (storedApiUrl) {
                setApiUrl(storedApiUrl);
            }
            setIsLoading(false);
        };
        fetchApiUrl();
    }, []);

    const updateApiUrl = async (url: string) => {
        await setItemAsync('apiUrl', url);
        setApiUrl(url);
    };

    return (
        <ApiContext.Provider value={{ apiUrl, setApiUrl, isLoading, updateApiUrl }}>
            {children}
        </ApiContext.Provider>
    );
}

export function useApi() {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
}