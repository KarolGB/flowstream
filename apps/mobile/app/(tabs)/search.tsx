import { useEffect, useState } from "react";
import { TextInput, View, Text, FlatList, TouchableOpacity, Image, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import apiClient from "../../api/client";
import { usePlayer } from "../../context/PlayerContext";
import { usePlaylist } from "../../context/PlaylistContext";
import Entypo from '@expo/vector-icons/Entypo';
import LoadingScreen from "../../components/LoadingScreen";


interface SearchResult {
    youtube_id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration_seconds: number;
}

const search = () => {
    const [query, setQuery] = useState("")
    const [error, setError] = useState("")
    const [songs, setSongs] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [pressedSong, setPressedSong] = useState<SearchResult | null>(null);
    const [saveInPlaylistModal, setSaveInPlaylistModal] = useState(false)
    const { playTrack } = usePlayer()
    const { playlists, addTrackToPlaylist } = usePlaylist()



    const searchSong = async () => {
        setIsLoading(true)
        if (!query) {
            return
        }
        const result = await apiClient.get(`/catalog/search?query=${query}`)
        setSongs(result.data.results)
        setIsLoading(false)
    }


    const formatSeconds = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    const closeModal = () => {
        setPressedSong(null);
        setSaveInPlaylistModal(false)
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-950 p-4 py-8">
            <View>
                <TextInput
                    placeholder="Search..."
                    value={query}
                    className="bg-neutral-900 text-white rounded-xl py-3 pl-4 pr-12 border border-neutral-800"
                    keyboardType="default"
                    placeholderTextColor="gray"
                    onChangeText={setQuery}
                    onSubmitEditing={searchSong}
                    returnKeyType="search"
                />
                <FontAwesome5
                    name="search"
                    size={24}
                    color="purple"
                    className="absolute right-2 top-2/4  transform -translate-y-2/4 z-20 p-2"
                    onPress={searchSong}
                />
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
                    <TouchableOpacity onPress={() => { playTrack(item) }} onLongPress={() => { setPressedSong(item) }} className="flex-row items-center bg-neutral-900/50 p-3 rounded-xl mb-3 border border-neutral-800/50">

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
                        <TouchableOpacity onPress={() => setPressedSong(item)} className="p-2 ml-2">
                            <Entypo name="dots-three-horizontal" size={20} color="#d946ef" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />

            <Modal
                visible={!!pressedSong}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
                statusBarTranslucent={true}
            >

                <View className="flex-1 justify-end">


                    <TouchableOpacity
                        className="absolute inset-0 bg-black/80"
                        activeOpacity={1}
                        onPress={closeModal}
                    />


                    <View className="bg-neutral-950 w-full rounded-t-3xl border-t border-neutral-800 min-h-[30%] max-h-[80%] pb-12 pt-2 shadow-2xl shadow-black">

                        {/* Barrita decorativa superior */}
                        <View className="w-12 h-1.5 bg-neutral-700 rounded-full self-center mb-6" />

                        {!saveInPlaylistModal && pressedSong ? (
                            <View className="px-6">
                                <View className="flex-row items-center mb-6">
                                    <Image source={{ uri: pressedSong.thumbnail }} className="w-16 h-16 rounded-xl mr-4 bg-neutral-800" />
                                    <View className="flex-1">
                                        <Text className="text-white font-bold text-lg" numberOfLines={1}>{pressedSong.title}</Text>
                                        <Text className="text-neutral-400">{pressedSong.artist}</Text>
                                    </View>
                                </View>

                                <View className="border-t border-neutral-800 w-full mb-4" />

                                <TouchableOpacity
                                    onPress={() => setSaveInPlaylistModal(true)}
                                    className="flex-row items-center bg-neutral-900 p-4 rounded-2xl border border-neutral-800"
                                >
                                    <FontAwesome5 name="plus" size={20} color="#d946ef" className="mr-4" />
                                    <Text className="text-white font-bold text-base">Añadir a una Playlist</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="px-6 flex-1">
                                <Text className="text-white text-xl font-bold mb-4 text-center">Tus Playlists</Text>

                                <FlatList
                                    data={playlists}
                                    keyExtractor={(item) => item.id.toString()}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                addTrackToPlaylist(item.id, pressedSong!.youtube_id, pressedSong!.title, pressedSong!.artist, pressedSong!.thumbnail, pressedSong!.duration_seconds);
                                                closeModal();
                                            }}
                                            className="flex-row items-center bg-neutral-900/80 p-3 rounded-xl mb-3 border border-neutral-800"
                                        >
                                            <View className="w-14 h-14 bg-neutral-800 rounded-lg justify-center items-center mr-4 overflow-hidden">
                                                <FontAwesome5 name="music" size={20} color="#525252" />
                                            </View>
                                            <Text className="text-white font-bold text-base flex-1" numberOfLines={1}>
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    )
}
export default search;