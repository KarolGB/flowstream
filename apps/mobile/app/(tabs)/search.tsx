import { useEffect, useState } from "react";
import { TextInput, View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import apiClient from "../../api/client";
import { usePlayer } from "../../context/PlayerContext";

interface SearchResult {
    youtube_id: string;
    title: string;
    artist: string;
    thumbnail_url: string;
    duration_seconds: number;
}

const search = () => {
    const [query, setQuery] = useState("")
    const [error, setError] = useState("")
    const [songs, setSongs] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { playTrack } = usePlayer()



    const searchSong = async () => {
        setIsLoading(true)
        if (!query) {
            return
        }
        const result = await apiClient.get(`/catalog/search?query=${query}`)
        setSongs(result.data.results)
        setIsLoading(false)
    }

    const reproduce = async (song: any) => {
        try {
            const response = await apiClient.get(`/stream/${song.youtube_id}`)
            const url = response.data.stream_url
            song["url"] = url
            playTrack(song)

        } catch (error) {
            console.log(error)

        }
    }

    const formatSeconds = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-950 p-4 py-8">
            <View>
                <TextInput placeholder="Search..." value={query} className="bg-white rounded-xl p-4 pr-12" keyboardType="default" placeholderTextColor="gray" onChangeText={setQuery} onSubmitEditing={searchSong} returnKeyType="search" ></TextInput>
                <FontAwesome5 name="search" size={24} color="purple" className="absolute right-2 top-2/4  transform -translate-y-2/4 z-20 p-2" onPress={searchSong} />
            </View>
            <FlatList
                data={songs}
                keyExtractor={(item) => item.youtube_id}
                showsVerticalScrollIndicator={false}
                className="my-8"
                ListEmptyComponent={
                    !isLoading && query ? (
                        <Text className="text-neutral-500 text-center mt-10">No se encontraron resultados.</Text>
                    ) : null
                }
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => { reproduce(item) }} className="flex-row items-center bg-neutral-900/50 p-3 rounded-xl mb-3 border border-neutral-800/50">

                        <View className="w-14 h-14 bg-neutral-800 rounded-lg justify-center items-center mr-4 overflow-hidden">
                            {item.thumbnail_url ? (
                                <Image source={{ uri: item.thumbnail_url }} className="w-full h-full" />
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

                    </TouchableOpacity>
                )}
            />
        </SafeAreaView >
    )
}
export default search;