import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "./AuthContext";


interface PlaylistContextType {
    playlists: {
        id: number;
        name: string;
        cover: string;
        total_tracks: number;
    }[];
    refreshPlaylists: () => void;
    createPlaylist: (name: string) => void;
    addTrackToPlaylist: (playlistId: number, youtubeId: string, name: string, artist: string, thumbnail: string, duration_seconds: number) => void;
    deleteTrackFromPlaylist: (playlistId: number, trackId: number) => void;
    deletePlaylist: (id: number) => void;
}

const PlaylistContext = createContext<PlaylistContextType>({
    playlists: [],
    refreshPlaylists: () => { },
    createPlaylist: (name: string) => { },
    addTrackToPlaylist: (playlistId: number, youtubeId: string, name: string, artist: string, thumbnail: string, duration_seconds: number) => { },
    deleteTrackFromPlaylist: (playlistId: number, trackId: number) => { },
    deletePlaylist: (id: number) => { },
});

export const usePlaylist = () => {
    return useContext(PlaylistContext);
}

export const PlaylistProvider = ({ children }: { children: React.ReactNode }) => {
    const [playlists, setPlaylists] = useState<PlaylistContextType["playlists"]>([]);
    const { isAuthenticated } = useAuth();
    const refreshPlaylists = async () => {
        try {
            const response = await apiClient.get("/playlists/")
            setPlaylists(response.data.playlists)
        } catch (error) {
            return
        }
    }

    const createPlaylist = async (name: string) => {
        try {
            await apiClient.post("/playlists/", { name })
            refreshPlaylists()
        } catch (error) {
            return
        }
    }

    const deletePlaylist = async (id: number) => {
        try {
            await apiClient.delete(`/playlists/${id}`)
            setPlaylists(playlists.filter(playlist => playlist.id !== id))
        } catch (error) {
            return
        }
    }

    const deleteTrackFromPlaylist = async (playlistId: number, trackId: number) => {
        try {
            await apiClient.delete(`/playlists/${playlistId}/tracks/${trackId}`)
            refreshPlaylists()
        } catch (error) {
            return
        }
    }

    const addTrackToPlaylist = async (playlistId: number, youtubeId: string, name: string, artist: string, thumbnail: string, duration_seconds: number) => {
        try {
            await apiClient.post(`/playlists/${playlistId}/tracks`, { "youtube_id": youtubeId, name, artist, thumbnail, duration_seconds })
            refreshPlaylists()
        } catch (error) {
            return
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            refreshPlaylists()
        } else {
            setPlaylists([])
        }
    }, [isAuthenticated])

    return (
        <PlaylistContext.Provider value={{ playlists, refreshPlaylists, createPlaylist, addTrackToPlaylist, deleteTrackFromPlaylist, deletePlaylist }}>
            {children}
        </PlaylistContext.Provider>
    )
}

