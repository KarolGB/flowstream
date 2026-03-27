import { View, Text } from "react-native"
import Icon from "../components/Icon"

const FlowStreamHero = () => {
    return (
        <View className="flex items-center gap-4 flex-col">
            <Icon />
            <Text className="text-4xl font-extrabold text-purple-700 tracking-tighter  shadow-fuchsia-500 mt-4">Flowstream</Text>
        </View>
    )
}

export default FlowStreamHero;