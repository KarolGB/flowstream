import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import '../global.css';
import { AuthProvider,useAuth } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';


const InitialLayout = () => {
    const {isAuthenticated, isLoading, hasUrl} = useAuth()
    
    const router = useRouter();
    const segments = useSegments(); 

    useEffect(() => {
        if (hasUrl === null) return;

        const inSetupScreen = segments[0] === 'setup';
        const inLoginScreen = segments[0] === "login"
        const inTabsGroup = segments[0] === "(tabs)"

        if (!hasUrl && !inSetupScreen) {
            router.replace('/setup');
        } else if(hasUrl && !isAuthenticated && !inLoginScreen && !isLoading){
            router.replace("/login")
        }else if(hasUrl && isAuthenticated && !inTabsGroup){
            router.replace("/(tabs)")
        }
    }, [hasUrl, segments, isAuthenticated]);

    if (hasUrl === null || isLoading ) {
        return (
            <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }
    return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <SafeAreaProvider>
                <InitialLayout />
            </SafeAreaProvider>
        </AuthProvider>
    );
}
