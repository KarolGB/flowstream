import { Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const TabsLayout = () => {
    return (
        <SafeAreaView className="flex flex-1 gap-8 p-4 bg-gray-800">
            <Text className="text-white">Hola Mundo</Text>
        </SafeAreaView>
    )
}

export default TabsLayout