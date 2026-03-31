import { createContext, useContext, ReactNode, useState, useEffect, useRef } from "react";
import { useAudioPlayer } from "expo-audio"
import apiClient from "../api/client";

export interface Track {
    youtube_id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration_seconds: number;
}

export interface PlaylistTracks {
    id: number;
    youtube_id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration_seconds: number;
}

interface PlayerContextType {
    play: () => void;
    pause: () => void;
    next: () => void;
    previous: () => void;
    isPlaying: boolean;
    currentTime: number;
    playTrack: (track: Track) => void;
    currentTrack: Track | PlaylistTracks | null;
    playPlaylist: (id: string | string[], tracks: PlaylistTracks[]) => void;
    toogleShuffle: () => void;
    playlistId: string | string[] | null;

}

const PlayerContext = createContext<PlayerContextType>({
    play: () => { },
    pause: () => { },
    next: () => { },
    previous: () => { },
    isPlaying: false,
    currentTime: 0,
    playTrack: (track: Track) => { },
    currentTrack: null,
    playPlaylist: (id: string | string[], tracks: PlaylistTracks[]) => { },
    toogleShuffle: () => { },
    playlistId: null
});


export const usePlayer = () => {
    return useContext(PlayerContext)
}

export const PlayerProvider = ({ children }: { children: ReactNode }) => {

    const [isPlaying, setIsPlaying] = useState(false);
    const [playlistId, setPlaylistId] = useState<string | string[] | null>(null)
    const [currentQueue, setCurrentQueue] = useState<Track[] | PlaylistTracks[]>([])
    const [currentTrack, setCurrentTrack] = useState<Track | null | PlaylistTracks>(null);
    const [currentTime, setCurrentTime] = useState(0)
    const [isShuffle, setIsShuffle] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const isChangingTrack = useRef(false)

    const toogleShuffle = () => setIsShuffle(!isShuffle)
    const player = useAudioPlayer("");

    const get_stream_url = async (youtube_id: string) => {
        try {
            const response = await apiClient.get(`/stream/${youtube_id}`)
            const url = response.data.stream_url
            return url

        } catch (error) {
            return null

        }
    }

    const play = () => {
        player.play()
        setIsPlaying(true)
    }

    const pause = () => {
        player.pause()
        setIsPlaying(false)
    }

    const next = async () => {
        let nextIndex = currentIndex + 1;
        if (isShuffle) {
            // Genera un número al azar diferente al actual
            do {
                nextIndex = Math.floor(Math.random() * currentQueue.length);
            } while (nextIndex === currentIndex && currentQueue.length > 1);
        }
        setCurrentIndex(nextIndex)
        playTrack(currentQueue[nextIndex])
    }

    const previous = () => {
        return
    }

    const playTrack = async (track: Track | PlaylistTracks) => {
        let url = await get_stream_url(track.youtube_id)
        if (!url) {
            setCurrentTrack(null)
            isChangingTrack.current = false
            return
        }
        setCurrentTrack(track)
        player.replace(url)
        play()
        isChangingTrack.current = false
    }

    const playPlaylist = (id: string | string[], tracks: PlaylistTracks[], startIndex = 0) => {
        if (tracks.length === 0) return;
        if (id === playlistId && isPlaying) {
            pause()
            return
        }
        if (id === playlistId && !isPlaying) {
            play()
            return
        }
        setPlaylistId(id)
        setCurrentQueue(tracks)
        let nextIndex = startIndex
        if (isShuffle) {
            do {
                nextIndex = Math.floor(Math.random() * tracks.length);
            } while (nextIndex === currentIndex && tracks.length > 1);
        }
        setCurrentTrack(tracks[nextIndex])
        setCurrentIndex(nextIndex)
        playTrack(tracks[nextIndex])
    }

    player.addListener("playbackStatusUpdate", () => {
        setCurrentTime(player.currentTime)
        if (player.duration && player.currentTime >= player.duration) {
            if (!isChangingTrack.current) {
                isChangingTrack.current = true
                next()
            }
        }
    })

    return (
        <PlayerContext.Provider value={{ play, pause, next, previous, isPlaying, currentTime, playTrack, currentTrack, playPlaylist, toogleShuffle, playlistId }}>
            {children}
        </PlayerContext.Provider>

    )
}