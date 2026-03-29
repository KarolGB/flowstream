import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/client";


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
}

const PlaylistContext = createContext<PlaylistContextType>({
    playlists: [],
    refreshPlaylists: () => { },
    createPlaylist: (name: string) => { },
    addTrackToPlaylist: (playlistId: number, youtubeId: string, name: string, artist: string, thumbnail: string, duration_seconds: number) => { },
});

export const usePlaylist = () => {
    return useContext(PlaylistContext);
}

export const PlaylistProvider = ({ children }: { children: React.ReactNode }) => {
    const [playlists, setPlaylists] = useState<PlaylistContextType["playlists"]>([])

    const refreshPlaylists = async () => {
        try {
            const response = await apiClient.get("/playlists/")
            setPlaylists(response.data.playlists)
        } catch (error) {
            console.log(error)
        }
    }

    const createPlaylist = async (name: string) => {
        try {
            const response = await apiClient.post("/playlists/", { name })
            setPlaylists([...playlists, response.data.playlist])
        } catch (error) {
            console.log(error)
        }
    }

    const deletePlaylist = async (id: number) => {
        try {
            await apiClient.delete(`/playlists/${id}/`)
            setPlaylists(playlists.filter(playlist => playlist.id !== id))
        } catch (error) {
            console.log(error)
        }
    }

    const addTrackToPlaylist = async (playlistId: number, youtubeId: string, name: string, artist: string, thumbnail: string, duration_seconds: number) => {
        try {
            await apiClient.post(`/playlists/${playlistId}/tracks/`, { "youtube_id": youtubeId, "name": name, "artist": artist, "thumbnail": thumbnail, "duration_seconds": duration_seconds })
            refreshPlaylists()
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        refreshPlaylists()
    }, [])

    return (
        <PlaylistContext.Provider value={{ playlists, refreshPlaylists, createPlaylist, addTrackToPlaylist }}>
            {children}
        </PlaylistContext.Provider>
    )
}

