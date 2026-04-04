import { useEffect, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { TouchableOpacity, Text, View, TextInput, FlatList, BackHandler } from "react-native"
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { usePlaylist } from "../../context/PlaylistContext";
import FontAwesome5 from "@expo/vector-icons/build/FontAwesome5";

const library = () => {
    const router = useRouter();
    const [addPlaylistScreen, setAddPlaylistScreen] = useState(false)
    const [playlistName, setPlaylistName] = useState("")
    const [error, setError] = useState("")
    const { playlists, refreshPlaylists, createPlaylist } = usePlaylist()

    useEffect(() => {
        const backAction = () => {
            if (addPlaylistScreen) {
                setAddPlaylistScreen(false);
                setPlaylistName("");
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [addPlaylistScreen]);

    return !addPlaylistScreen ? (

        <SafeAreaView className="flex-1 bg-neutral-950 p-4">
            <View className="flex-row justify-between items-center mb-6 mt-2">
                <Text className="text-white text-3xl font-extrabold tracking-tight">Library</Text>

                <TouchableOpacity onPress={() => setAddPlaylistScreen(true)} className="bg-neutral-900 p-2.5 rounded-full border border-neutral-800 shadow shadow-black/30">
                    <Ionicons name="add-circle" size={26} color="#d946ef" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={playlists}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                className="my-8"
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => router.push(`/playlist/${item.id}`)} className="flex-row items-center mb-4 bg-neutral-900/50 p-3 rounded-2xl border border-neutral-800/50 shadow-sm shadow-black/20">

                        <View className="w-16 h-16 rounded-xl bg-neutral-800 mr-4 overflow-hidden border justify-center items-center border-neutral-700/50">
                            <FontAwesome5 name="music" size={20} color="#525252" />
                        </View>

                        <View className="flex-1 justify-center">
                            <Text className="text-white font-bold text-base" numberOfLines={1}>
                                {item.name}
                            </Text>
                            <Text className="text-neutral-500 text-xs mt-1">
                                Playlist • {item.total_tracks} canciones
                            </Text>
                        </View>

                        <Ionicons name="chevron-forward" size={20} color="#404040" className="mr-1" />
                    </TouchableOpacity>
                )}

            />


        </SafeAreaView>
    ) : (
        <SafeAreaView className="flex-1 bg-neutral-950 p-4 justify-center items-center">
            <View className="w-full">
                <TextInput placeholder="Playlist Name" autoFocus value={playlistName} className="text-white bg-neutral-900/50 rounded-xl p-4 pr-12 w-full" keyboardType="default" placeholderTextColor="gray" onSubmitEditing={() => createPlaylist(playlistName)} onChangeText={setPlaylistName} returnKeyType="send" ></TextInput>
            </View>
            <View className="flex-row gap-4 mt-8">
                <TouchableOpacity onPress={() => setAddPlaylistScreen(false)} className="p-4 px-8 rounded-2xl bg-neutral-900/50">
                    <Text className="text-white">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { createPlaylist(playlistName); setAddPlaylistScreen(false) }} className="p-4 px-8 rounded-2xl bg-neutral-600/65">
                    <Text className="text-white">Create</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default library