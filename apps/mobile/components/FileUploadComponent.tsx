import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client'; // Tu cliente Axios
import { usePlaylist } from '../context/PlaylistContext';

export default function CsvImporter() {
    const [selectedCsv, setSelectedCsv] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { refreshPlaylists } = usePlaylist()

    const pickCsvFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*", // 👈 Dejamos que el SO muestre todo para evitar bloqueos
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                const file = result.assets[0];

                // 👇 LA VALIDACIÓN MANUAL (El secreto del Arquitecto) 👇
                if (!file.name.toLowerCase().endsWith('.csv')) {
                    Alert.alert("Formato Inválido", "Por favor, selecciona un archivo terminado en .csv");
                    return;
                }

                setSelectedCsv(file);
            }
        } catch (error) {
            console.error("Error al seleccionar archivo:", error);
        }
    };

    const uploadCsvToFastAPI = async () => {
        if (!selectedCsv) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', {
            uri: selectedCsv.uri,
            name: selectedCsv.name,
            type: 'text/csv', // Aquí sí forzamos el tipo para FastAPI
        } as any);

        try {
            // Enviamos el CSV crudo a tu Raspberry Pi
            const response = await apiClient.post('/playlists/import-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert("¡Éxito!", `Se han importado ${response.data.imported_count} canciones.`);
            refreshPlaylists() // Refresca las playlists para mostrar la nueva

            setSelectedCsv(null); // Limpiamos la UI
        } catch (error) {
            Alert.alert("Error", "Hubo un problema al subir el CSV.");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <View className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
            <TouchableOpacity
                onPress={pickCsvFile}
                className="bg-neutral-900 border border-fuchsia-500 rounded-lg p-4 flex-row items-center justify-center gap-2"
            >
                <Ionicons name="document-text-outline" size={24} color="#d946ef" />
                <Text className="text-fuchsia-500 font-bold">Seleccionar CSV de Canciones</Text>
            </TouchableOpacity>

            {selectedCsv && (
                <View className="mt-4 p-3 bg-neutral-900 rounded-lg border border-neutral-700">
                    <Text className="text-white font-bold">{selectedCsv.name}</Text>

                    <TouchableOpacity
                        onPress={uploadCsvToFastAPI}
                        disabled={isUploading}
                        className={`mt-3 p-3 rounded-md items-center ${isUploading ? 'bg-fuchsia-800' : 'bg-fuchsia-600'}`}
                    >
                        <Text className="text-white font-bold">
                            {isUploading ? "Procesando en el servidor..." : "Importar a la Base de Datos"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}