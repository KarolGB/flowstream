
import { Text } from "react-native"
import { useAuth } from "../../context/AuthContext"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect } from "react"


const Index = () => {

    useEffect(() => {
        console.log("Index screen mounted")
    }, [])

    const { logout } = useAuth()
    return (
        <SafeAreaView className="flex-1 bg-neutral-950">
        </SafeAreaView>
    )
}
export default Index