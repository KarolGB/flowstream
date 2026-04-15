import { usePlayer } from "../context/PlayerContext";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Foundation } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import ProgressBar from "./ProgessBar";
const Player = () => {
    const { play, pause, isPlaying, currentTrack, next, isLoading, previous } = usePlayer()

    if (!currentTrack) return null;
    return (
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
                        <TouchableOpacity onPress={previous}>
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
                <ProgressBar />

            </View>
        </View >
    )

}

export default Player;