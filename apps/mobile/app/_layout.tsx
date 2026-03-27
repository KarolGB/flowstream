import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import '../global.css';


const InitialLayout = () => {
    const { isAuthenticated, isLoading, hasUrl } = useAuth()

    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (hasUrl === null) return;

        const inSetupScreen = segments[0] === 'setup';
        const inLoginScreen = segments[0] === "login"
        const inTabsGroup = segments[0] === "(tabs)"

        if (!hasUrl && !inSetupScreen) {
            router.replace('/setup');
        } else if (hasUrl && !isAuthenticated && !inLoginScreen && !isLoading) {
            router.replace("/login")
        } else if (hasUrl && isAuthenticated && !inTabsGroup) {
            router.replace("/(tabs)")
        }
    }, [hasUrl, segments, isAuthenticated]);

    if (hasUrl === null || isLoading) {
        return (
            <View className='flex-1 bg-neutral-950 justify-center align-center'>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }
    return <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0a0a0a" },
        animation: 'fade'
    }}
    />;
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <SafeAreaProvider className='bg-neutral-950'>
                <InitialLayout />
            </SafeAreaProvider>
        </AuthProvider>
    );
}
