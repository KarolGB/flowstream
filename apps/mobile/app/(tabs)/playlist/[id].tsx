import { View, Text, FlatList, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import apiClient from "../../../api/client"
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { usePlayer } from "../../../context/PlayerContext"
import LoadingScreen from "../../../components/LoadingScreen"
import PlayingEqualizer from "../../../components/PlayingEqualizer"
import PausedEqualizer from "../../../components/PausedEqualizer"


interface PlaylistDetail {
    id: number,
    name: string,
    cover: string,
    total_tracks: number,
    total_duration: number,
    tracks: {
        id: number,
        youtube_id: string,
        title: string,
        artist: string,
        thumbnail: string,
        duration_seconds: number,
        position: number
    }[]
}

const PlayListDetailScreen = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [playlistDetail, setPlaylistDetail] = useState<PlaylistDetail | null>(null)
    const [tracks, setTracks] = useState<PlaylistDetail["tracks"]>([])
    const { id } = useLocalSearchParams()
    const { playPlaylist, toogleShuffle, playlistId, isPlaying, currentTrack } = usePlayer()

    const formatSeconds = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    useEffect(() => {
        const fetchPlaylistDetail = async () => {
            try {
                const response = await apiClient.get(`/playlists/${id}`)
                setPlaylistDetail(response.data.playlist)
                setTracks(response.data.playlist_tracks)
            } catch (error) {
                setIsLoading(false)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPlaylistDetail()
    }, [id])

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-950 p-4 gap-8">
            <View className="justify-center items-center">
                <Text className="text-white text-2xl font-bold">{playlistDetail?.name}</Text>
                <View className="flex-row gap-4">
                    <Text className="text-neutral-500">{playlistDetail?.total_tracks} canciones</Text>
                    <Text className="text-neutral-500">{formatSeconds(playlistDetail?.total_duration || 0)}m</Text>
                </View>
            </View>
            <View className="flex-row gap-2 justify-end items-center">
                <TouchableOpacity onPress={toogleShuffle} className="w-12 h-12 bg-neutral-700 rounded-full items-center justify-center border-purple-600 border-2">
                    <Entypo name="shuffle" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => playPlaylist(id, tracks, -1)} className="w-16 h-16 bg-purple-700/50 rounded-full items-center justify-center shadow-2xl shadow-white">
                    {playlistId === id && isPlaying ? (
                        <FontAwesome5 name="pause" size={24} color="white" />
                    ) : (
                        <Entypo name="controller-play" size={32} color="white" />

                    )}
                </TouchableOpacity>
            </View>
            <FlatList
                data={tracks}
                keyExtractor={item => item.position.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => playPlaylist(id, tracks, item.position - 1)} className="flex-row items-center bg-neutral-900/50 p-3 rounded-xl mb-3 border border-neutral-800/50">
                        <View className="w-6 mr-4 justify-center items-center">
                            {currentTrack?.youtube_id === item.youtube_id ? (
                                isPlaying ? <PlayingEqualizer /> : <PausedEqualizer />
                            ) : (
                                <Text className="text-neutral-500">{item.position}</Text>
                            )}

                        </View>

                        <View className="w-14 h-14 bg-neutral-800 rounded-lg justify-center items-center mr-4 overflow-hidden">
                            {item.thumbnail ? (
                                <Image source={{ uri: item.thumbnail }} className="w-full h-full" />
                            ) : (
                                <FontAwesome5 name="music" size={20} color="#525252" />
                            )}
                        </View>

                        <View className="flex-1">
                            <Text className="text-white font-bold text-base" numberOfLines={1}>
                                {item.title}
                            </Text>
                            <Text className="text-neutral-400 text-sm" numberOfLines={1}>
                                {item.artist} • {formatSeconds(item.duration_seconds)}
                            </Text>
                        </View>
                        <TouchableOpacity className="p-2 ml-2">
                            <Entypo name="dots-three-horizontal" size={20} color="#d946ef" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            >

            </FlatList>
        </SafeAreaView>)
}

export default PlayListDetailScreen;