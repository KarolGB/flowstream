import { View, ActivityIndicator } from "react-native";

const LoadingScreen = () => {
    return (
        <View className='flex-1 bg-neutral-950 justify-center align-center'>
            <ActivityIndicator size="large" color="purple" />
        </View>
    );
}

export default LoadingScreen;