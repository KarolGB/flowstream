import { useEffect, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { TouchableOpacity, Text, View, TextInput, FlatList, BackHandler, Modal } from "react-native"
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { usePlaylist } from "../../context/PlaylistContext";
import FontAwesome5 from "@expo/vector-icons/build/FontAwesome5";
import * as DocumentPicker from 'expo-document-picker';
import apiClient from "../../api/client";

const library = () => {
    const router = useRouter();
    const [addPlaylistModal, setAddPlaylistModal] = useState<boolean>(false)
    const [playlistName, setPlaylistName] = useState("")
    const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null)
    const [error, setError] = useState("")
    const { playlists, createPlaylist, deletePlaylist, refreshPlaylists } = usePlaylist()
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const backAction = () => {
            if (addPlaylistModal) {
                setAddPlaylistModal(false);
                setPlaylistName("");
                return true;
            }
            if (selectedPlaylist) {
                setSelectedPlaylist(null);
                return true;
            }
            if (addPlaylistModal) {
                setAddPlaylistModal(false);
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
    }, [addPlaylistModal]);

    const closeModal = () => {
        setSelectedPlaylist(null);
        setAddPlaylistModal(false)
    }
    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                const file = result.assets[0];


                if (!file.name.toLowerCase().endsWith('.csv')) {
                    return;
                }

                setIsUploading(true);
                const formData = new FormData();
                formData.append('file', {
                    uri: file.uri,
                    name: file.name,
                    type: 'text/csv',
                } as any);
                try {
                    const response = await apiClient.post('/playlists/import-csv', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    refreshPlaylists()
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsUploading(false);
                }
                setAddPlaylistModal(false)

            }
        } catch (error) {
            console.error("Error selecting file:", error);
        }
    };


    return (

        <SafeAreaView className="flex-1 bg-neutral-950 p-4">
            <View className="flex-row justify-between items-center mb-6 mt-2">
                <Text className="text-white text-3xl font-extrabold tracking-tight">Library</Text>

                <TouchableOpacity onPress={() => setAddPlaylistModal(true)} className="bg-neutral-900 p-2.5 rounded-full border border-neutral-800 shadow shadow-black/30">
                    <Ionicons name="add-circle" size={26} color="#d946ef" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={playlists}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                className="my-8"
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => router.push(`/playlist/${item.id}`)} onLongPress={() => setSelectedPlaylist(item.id)} className="flex-row items-center mb-4 bg-neutral-900/50 p-3 rounded-2xl border border-neutral-800/50 shadow-sm shadow-black/20">

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

                        <Ionicons name="chevron-forward" size={20} color="#d946ef" className="mr-1" />
                    </TouchableOpacity>
                )}

            />
            <Modal
                visible={!!selectedPlaylist}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
                statusBarTranslucent={true}
            >
                <View className="flex-1 justify-end pb-12">


                    <TouchableOpacity
                        className="absolute inset-0 bg-black/80"
                        activeOpacity={1}
                        onPress={closeModal}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            deletePlaylist(selectedPlaylist!)
                            closeModal()
                        }}
                        className="flex-row items-center bg-neutral-900 p-4 rounded-2xl border border-neutral-800"
                    >
                        <FontAwesome5 name="minus" size={20} color="#d946ef" className="mr-4" />
                        <Text className="text-white font-bold text-base">Eliminar Playlist</Text>
                    </TouchableOpacity>
                </View>

            </Modal>
            <Modal
                visible={addPlaylistModal}
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
                    <View className="bg-neutral-950 w-full rounded-t-3xl mt-4 max-h-[80%] pb-12 pt-2 shadow-2xl shadow-black gap-4 px-4">
                        <TouchableOpacity
                            className="flex-row items-center bg-neutral-900 p-4 rounded-2xl border border-neutral-800"
                        >
                            <FontAwesome5 name="plus" size={20} color="#d946ef" className="mr-4" />
                            <Text className="text-white font-bold text-base">Create PlayList</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center bg-neutral-900 p-4 rounded-2xl border border-neutral-800"
                            onPress={pickFile}
                        >
                            <FontAwesome5 name="upload" size={20} color="#d946ef" className="mr-4" />
                            <Text className="text-white font-bold text-base">Import PlayList from CSV</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </Modal>

        </SafeAreaView>
    )
}

export default library