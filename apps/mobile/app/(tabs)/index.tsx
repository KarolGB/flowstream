import { use } from "react"
import { View, Text } from "react-native"
import { useAuth } from "../../context/AuthContext"
import { SafeAreaView } from "react-native-safe-area-context"


const Index = () => {
    const {logout} = useAuth()
    return (
        <SafeAreaView className="flex-1 bg-neutral-950"></SafeAreaView>
    )
}
export default Index