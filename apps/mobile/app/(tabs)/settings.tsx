import { useEffect, useState } from "react"
import { Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as SecureStore from 'expo-secure-store';
import { useAuth } from "../../context/AuthContext";
const settings = () => {
    const { logout } = useAuth()
    const [baseUrl, setBaseUrl] = useState<string | null>(null);

    useEffect(() => {
        const getConfig = async () => {
            const url = await SecureStore.getItemAsync('baseUrl');
            setBaseUrl(url);
        }
        getConfig()
        console.log("Settings screen mounted")
    })

    return (
        <SafeAreaView className="flex-1 bg-neutral-950 p-4">
            <Text className="text-white" >{baseUrl}</Text >
            <Text className="text-white mt-16 p-4" onPress={logout}>Logout</Text>
        </SafeAreaView>
    )
}

export default settings