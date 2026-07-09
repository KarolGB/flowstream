import { ActivityIndicator, View } from "react-native";

export default function LoadingSpinner() {
    return (
        <View className="flex items-center justify-center h-screen">
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
}