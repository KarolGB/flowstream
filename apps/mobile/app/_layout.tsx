import LoadingSpinner from "@/components/LoadingSpinner"
import { Stack } from "expo-router"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ApiProvider, useApi } from "../context/ApiContext"
import { AuthProvider, useAuth } from "../context/AuthContext"
import "../global.css"

function InitialLayout() {
    const { apiUrl, isLoading: apiLoading } = useApi()
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    if (apiLoading || authLoading) {
        return (
            <LoadingSpinner />
        )
    }

    return (
        <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0a0a0a" },
            animation: 'none'
        }}>
            <Stack.Protected guard={!apiUrl} >
                <Stack.Screen name="setup" />
            </Stack.Protected>
            <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen name="login" />
            </Stack.Protected>
            <Stack.Protected guard={isAuthenticated && !!apiUrl}>
                <Stack.Screen name="(home)" />
            </Stack.Protected>
        </Stack>
    )
}

export default function RootLayout() {
    return (
        <ApiProvider>
            <AuthProvider>
                <SafeAreaProvider>
                    <InitialLayout />
                </SafeAreaProvider>
            </AuthProvider>
        </ApiProvider>
    )
}