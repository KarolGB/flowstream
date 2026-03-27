import { useState } from "react"
import { TextInput, Pressable,Text } from "react-native"
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import apiClient from "../api/client";
import * as SecureStore from 'expo-secure-store';
import { useAuth } from "../context/AuthContext";

const setup = () => {
    const [url,setUrl] = useState("");
    const [error,setError] = useState("");
    const {saveUrl} = useAuth()
    const validateUrl = async () => {
        if (!url) return;
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = `http://${cleanUrl}`;
        }
        cleanUrl = cleanUrl.replace(/\/+$/, "");
        try {
            const response = await apiClient.get(url)
            if (response.status !== 200){
                setError("No hay conexion con la api")
                return
            }
            const content = await response.data
            if (content["message"] !== "API Is Working"){
                setError("Ruta de API Incorrecta")
                return
            }
            setError("")
            saveUrl(cleanUrl)
            
        } catch (error) {
            console.log(error)
            setError("No hay conexion con la api")
        }
    }



    return (
        <SafeAreaProvider >
            <SafeAreaView className="flex flex-1 bg-gray-800 justify-center items-center">
                <Text className="text-white text-4xl mb-8">Server address</Text>
                {error && <Text className="text-red-500">{error}</Text>}
                <TextInput onChangeText={setUrl} autoFocus={true} value={url}className="bg-white px-4 mx-4 w-2/3 rounded-xl" placeholder="https://your-ip:8000/api" keyboardType="url" placeholderTextColor="gray"></TextInput>    
                <Pressable onPress={validateUrl}>
                    <Text className="text-white mt-8 bg-black p-4 rounded-lg px-16">Submit</Text>
                </Pressable>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}
export default setup

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#000',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding:20,
//     },
//     input: {
//     width: '100%', // Ocupa todo el espacio disponible dentro del container
//     height: 50,
//     backgroundColor: 'rgb(255, 255, 255)',
//     color: '#FFFFFF',
//     borderRadius: 8, // Bordes redondeados modernos
//     paddingHorizontal: 15,
//   }
// })