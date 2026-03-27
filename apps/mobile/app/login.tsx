import { useEffect, useState } from "react"
import { Text, TextInput, Pressable, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import Icon from "../components/Icon"
import Entypo from '@expo/vector-icons/Entypo';
import FlowStreamHero from "../components/FlowStreamHero";



const login = () => {
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { setIsAuthenticated, login, deleteUrl } = useAuth()
    const [url, setUrl] = useState("")
    useEffect(() => {
        const get_url = async () => {
            const url = await SecureStore.getItemAsync('baseUrl') || "";
            setUrl(url)
        }
        get_url()

    }, [])


    const handleLogin = async () => {
        try {
            const response = await login(identifier, password)
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message;
            setError(errorMessage)
            return
        }
    }
    return (
        <SafeAreaView className="flex-1 gap-4 p-4 bg-neutral-950">
            <FlowStreamHero />
            <View className="flex-row items-center gap-2 shadow  justify-center">
                <View className="w-2 h-2 bg-purple-600 rounded-full shadow shadow-green-500"></View>
                <Text className="text-gray-400" >Conectado a: <Text className="text-purple-600">{url}</Text></Text>
                <Entypo onPress={deleteUrl} name="edit" size={12} color="gray" />
            </View>
            {error && <Text className="text-red-500 text-center">{error}</Text>}
            <View className="gap-2 ">
                <Text className="text-white">User or Email</Text>
                <TextInput className="w-full border rounded-2xl p-4 text-white shadow shadow-gray-200 bg-black" placeholderTextColor={"gray"} onChangeText={setIdentifier} value={identifier} placeholder="your@email.com" keyboardType="url"></TextInput>
            </View>
            <View className="gap-2">
                <Text className="text-white">Password</Text>
                <TextInput className="w-full border rounded-2xl p-4 text-white shadow shadow-gray-200 bg-black" placeholderTextColor={"gray"} onChangeText={setPassword} value={password} placeholder="password" keyboardType="default" secureTextEntry></TextInput>
            </View>
            <Pressable className="w-full bg-purple-800 p-4 rounded-2xl shadow shadow-fuchsia-300" onPress={handleLogin}>
                <Text className="text-center text-white font-extrabold text-xl">Login</Text>
            </Pressable>
        </SafeAreaView>
    )
}

export default login