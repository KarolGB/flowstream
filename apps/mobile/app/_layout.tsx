import { router, Stack } from "expo-router"
import { useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ApiProvider, useApi } from "../context/ApiContext"
import { AuthProvider, useAuth } from "../context/AuthContext"
import "../global.css"

function InitialLayout() {
    const { apiUrl, isLoading: apiLoading } = useApi()
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    useEffect(() => {
        if (apiLoading || authLoading) return;
        if (!apiUrl) {
            router.replace("/setup")
        } else if (!isAuthenticated) {
            router.replace("/login")
        } else {
            router.replace("/home")
        }
    }, [apiUrl, isAuthenticated, apiLoading, authLoading])

    if (apiLoading || authLoading) return;

    return <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0a0a0a" },
        animation: 'none'
    }}
    />
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ApiProvider>
                <AuthProvider>
                    <InitialLayout />
                </AuthProvider>
            </ApiProvider>
        </SafeAreaProvider>
    )
}