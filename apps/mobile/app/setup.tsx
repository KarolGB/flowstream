import { useState } from "react"
import { TextInput, Pressable, Text, View } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FlowStreamHero from "../components/FlowStreamHero";



const setup = () => {
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");
    const { saveUrl } = useAuth()
    const validateUrl = async () => {
        if (!url) return;
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = `http://${cleanUrl}`;
        }
        cleanUrl = cleanUrl.replace(/\/+$/, "");
        try {
            const response = await apiClient.get(url)
            const content = await response.data
            if (content["message"] !== "API Is Working") {
                setError("Ruta de API Incorrecta")
                return
            }
            setError("")
            saveUrl(cleanUrl)

        } catch (error) {
            setError("No hay conexion con la api")
        }
    }



    return (
        <SafeAreaView className="flex flex-1 bg-neutral-950 justify-center items-center gap-16">
            <FlowStreamHero />
            <View className="w-2/3 gap-4">
                {error && <Text className="text-red-500 text-center">{error}</Text>}
                <View>
                    <TextInput onChangeText={setUrl} autoFocus={true} value={url} className="w-full text-white border border-white px-4 pr-12 mx-4 rounded-xl" placeholder="https://..." keyboardType="url" autoCapitalize="none" placeholderTextColor="gray"></TextInput>
                    <FontAwesome5 name="arrow-right" size={24} color="purple" className="absolute right-0 top-2/4 transform -translate-y-2/4 z-20 p-2" onPress={validateUrl} />
                </View>
                <Text className="text-white text-center">Address Of Your API Server</Text>
            </View>
        </SafeAreaView>
    )
}
export default setup