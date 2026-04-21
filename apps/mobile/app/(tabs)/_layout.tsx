import { Tabs, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from "react-native"
import Player from '../../components/Player';






export default function TabsLayout() {

  const segments = useSegments()
  const insidePlaylist = segments[1] === "playlist"

  return (
    <View className="flex-1 bg-neutral-950">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0a0a0a',
            borderTopColor: '#262626',
            paddingBottom: 12,
            paddingTop: 5,
            height: 65,
          },
          tabBarActiveTintColor: '#d946ef',
          tabBarInactiveTintColor: '#525252',
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: 'bold',
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Buscar',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "search" : "search-outline"} size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Biblioteca',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "library" : "library-outline"} size={26} color={focused || insidePlaylist ? '#d946ef' : color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Configuración',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "settings" : "settings-outline"} size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="playlist/[id]"
          options={{
            href: null,
            headerShown: false
          }}
        />
      </Tabs>

      <Player />
    </View >
  );
}