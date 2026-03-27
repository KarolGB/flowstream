import { useState } from "react"
import { Text, TextInput, Pressable, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from '../context/AuthContext';

const login = () => {
    const [identifier,setIdentifier] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")
    const {setIsAuthenticated,login,deleteUrl} = useAuth()
    const handleLogin = async () => {
        try{
            const response = await login(identifier,password)
        }catch(error: any){
            const errorMessage = error.response?.data?.detail || error.message;
            setError(errorMessage)
            return
        }
    }
    return (
        <SafeAreaView className="flex flex-1 gap-8 p-4 bg-gray-800">
            {error && <Text className="text-red-500">{error}</Text>}
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