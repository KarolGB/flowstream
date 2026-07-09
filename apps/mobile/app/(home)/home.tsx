import { Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
export default function home() {
    const { logout } = useAuth();
    return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <Text className=" text-2xl font-bold">Home</Text>
            <Pressable className="bg-blue-500 rounded p-2 mt-4" onPress={async () => {
                logout();
            }}>
                <Text className="text-white">Logout</Text>
            </Pressable>
        </SafeAreaView>
    )
}