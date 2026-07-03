import { useState } from "react"
import { Pressable, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useApi } from "../context/ApiContext"

export default function Setup() {
    const [apiUrl, setApiUrl] = useState("")
    const { updateApiUrl } = useApi()
    const [error, setError] = useState<string | null>(null)
    const handleSave = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error("Invalid API URL");
            }
        } catch (error) {
            setError("Invalid API URL");
            return;
        }
        await updateApiUrl(apiUrl);
    }
    return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <View>
                {error && <Text className="text-red-500 mb-4 text-center">{error}</Text>}
                <TextInput
                    onChangeText={setApiUrl}
                    value={apiUrl}
                    placeholder="Enter API URL"
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    className="border border-gray-300 rounded p-2 mb-4 w-64 placeholder:text-gray-400 color-white"
                    onSubmitEditing={handleSave}
                />
                <Pressable onPress={handleSave} className="bg-blue-500 rounded p-2">
                    <Text className="text-white text-center">Save</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}