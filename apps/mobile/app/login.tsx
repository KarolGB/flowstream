import { useState } from "react"
import { Pressable, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useApi } from "../context/ApiContext"
import { useAuth } from "../context/AuthContext"
export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { login } = useAuth()
    const { apiUrl } = useApi()
    const handleLogin = async () => {
        // Implement login logic here
    }
    return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <View className="flex-1 items-center justify-center">
                <View className="bg-zinc-800 p-8 rounded-lg">
                    <Text className="text-white text-2xl font-bold mb-4">Login</Text>
                    <Text className="text-white mb-4">API URL: {apiUrl}</Text>
                    <TextInput
                        placeholder="Email"
                        className="border border-gray-300 rounded p-2 mb-4 w-64 placeholder:text-gray-400 color-white"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                    />
                    <TextInput
                        placeholder="Password"
                        secureTextEntry
                        className="border border-gray-300 rounded p-2 mb-4 w-64 placeholder:text-gray-400 color-white"
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                    />
                    <Pressable className="bg-blue-500 rounded p-2" onPress={handleLogin}>
                        <Text className="text-white text-center">Login</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    )
}