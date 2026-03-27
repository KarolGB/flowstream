import { useState } from "react"
import { Text, TextInput, Pressable, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';

import axios, { AxiosError } from "axios"

const login = () => {
    const [identifier,setIdentifier] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")
    const {setIsAuthenticated} = useAuth()
    const handleLogin = async () => {
        try{
            const response = await axios.post("http://10.0.0.100:8000/auth/login",{identifier,password})
            let access_token = response.data.access_token
            let refresh_token = response.data.refresh_token
            if (!access_token || !refresh_token){
                setError("Invalid credentials")
                return
            }
            await SecureStore.setItemAsync('access_token', access_token);
            await SecureStore.setItemAsync('refresh_token', refresh_token);
            setIsAuthenticated(true)
            setError("")
            return
        }catch(error: any){
            const errorMessage = error.response?.data?.detail || error.message;
            console.log(errorMessage)
            setError(errorMessage)
            return
        }
    }


    return (
        <SafeAreaView className="flex flex-1 gap-8 p-4 bg-gray-800">
            <View className="flex flex-col gap-2">
                <Text className="text-white">User or Email</Text>
                <TextInput className="w-full border rounded-2xl p-4 text-white" placeholderTextColor={"gray"} onChangeText={setIdentifier} value={identifier} placeholder="your@email.com" keyboardType="url"></TextInput>
            </View>
            <View className="flex flex-col gap-2">
                <Text className="text-white">Password</Text>
                <TextInput className="w-full border rounded-2xl p-4 text-white" placeholderTextColor={"gray"} onChangeText={setPassword} value={password} placeholder="password" keyboardType="default" secureTextEntry></TextInput>
            </View>
            <Pressable className="w-full bg-purple-700 p-4 rounded-2xl" onPress={handleLogin}>
                <Text className="text-center text-white font-bold">Login</Text>
            </Pressable>
        </SafeAreaView>
    )
}

export default login