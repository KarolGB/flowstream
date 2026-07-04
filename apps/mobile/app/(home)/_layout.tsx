import { Tabs } from "expo-router"
export default function Layout() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: "#0a0a0a" },
            tabBarActiveTintColor: "#fff",
            tabBarInactiveTintColor: "#888",
        }}>
            <Tabs.Screen name="home" options={{ title: "Home" }} />
        </Tabs>
    )
}