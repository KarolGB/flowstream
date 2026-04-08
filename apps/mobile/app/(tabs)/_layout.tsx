import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, Image, TouchableOpacity, ActivityIndicator } from "react-native"
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import Foundation from '@expo/vector-icons/Foundation';
import { usePlayer } from '../../context/PlayerContext';






export default function TabsLayout() {
  const { play, pause, isPlaying, currentTrack, next, currentTime, isLoading } = usePlayer()
  const duration = currentTrack?.duration_seconds || 1
  let progressPercentage = (currentTime / duration) * 100
  progressPercentage = Math.min(100, Math.max(0, progressPercentage));
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
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "library" : "library-outline"} size={26} color={color} />,
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

      {currentTrack && (
        <View className='absolute bottom-[65px] w-[96%] self-center shadow-lg shadow-black z-10'>

          <View className='w-full flex-row items-center bg-neutral-900 rounded-xl p-2 border border-neutral-800 overflow-hidden'>

            <Image
              className='w-12 h-12 rounded-md bg-neutral-800'
              source={{ uri: currentTrack?.thumbnail }}
            />

            <View className='justify-center ml-3 flex-1'>
              <Text className='text-white font-bold text-sm' numberOfLines={1}>{currentTrack?.title}</Text>
              <Text className='text-fuchsia-500 text-xs' numberOfLines={1}>{currentTrack?.artist}</Text>
            </View>
            {isLoading ? (
              <ActivityIndicator className='self-center justify-self-center' size="large" color="#d946ef" />
            ) : (
              <View className='flex-row gap-4 items-center mr-2'>
                <TouchableOpacity>
                  <Foundation name="previous" size={28} color="#d946ef" />
                </TouchableOpacity>
                <TouchableOpacity onPress={isPlaying ? pause : play}>
                  {isPlaying ? (
                    <MaterialIcons name="pause-circle" size={36} color="#d946ef" />
                  ) : (
                    <MaterialIcons name="play-circle" size={36} color="#d946ef" />
                  )}
                </TouchableOpacity>


                <TouchableOpacity onPress={next}>
                  <Entypo name="controller-next" size={28} color="#d946ef" />
                </TouchableOpacity>
              </View>
            )}


            <View className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-800">
              <View
                className="h-full bg-fuchsia-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>

          </View>
        </View >
      )
      }
    </View >
  );
}