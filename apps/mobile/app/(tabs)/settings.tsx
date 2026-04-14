import { Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
const settings = () => {
    return (
        <SafeAreaView className="flex-1 bg-neutral-950 p-4">
            <Text className="text-white" > Settings</Text >
        </SafeAreaView>
    )
}

export default settings