
import { Text } from "react-native"
import { useAuth } from "../../context/AuthContext"
import { SafeAreaView } from "react-native-safe-area-context"
import FileUploadComponent from "../../components/FileUploadComponent"


const Index = () => {
    const { logout } = useAuth()
    return (
        <SafeAreaView className="flex-1 bg-neutral-950">
            <Text className="text-white mt-16 p-4" onPress={logout}>Logout</Text>
            <FileUploadComponent />
        </SafeAreaView>
    )
}
export default Index