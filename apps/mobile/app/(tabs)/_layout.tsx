import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ocultamos la cabecera fea por defecto de arriba
        tabBarStyle: {
          backgroundColor: '#0a0a0a', // Fondo casi negro puro (neutral-950)
          borderTopColor: '#262626', // Borde sutil gris oscuro
          height: 65, // Un poco más alta para que sea cómoda
          paddingBottom: 10, // Espacio para la barrita de iOS
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#d946ef', // Fuchsia vibrante para la pestaña activa
        tabBarInactiveTintColor: '#525252', // Gris apagado para las inactivas
        tabBarShowLabel: true, // Mostrar el texto debajo del icono
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        }
      }}
    >
      {/* 1. Pestaña de INICIO */}
      <Tabs.Screen
        name="index" // Apunta al archivo index.tsx
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
          ),
        }}
      />

      {/* 2. Pestaña de BUSCAR */}
      <Tabs.Screen
        name="search" // Apunta al archivo search.tsx
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={26} color={color} />
          ),
        }}
      />

      {/* 3. Pestaña de BIBLIOTECA */}
      <Tabs.Screen
        name="library" // Apunta al archivo library.tsx
        options={{
          title: 'Biblioteca',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "library" : "library-outline"} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}