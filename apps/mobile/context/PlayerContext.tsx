import { createContext, useContext, ReactNode, useState, useEffect, useRef } from "react";
import { setAudioModeAsync } from 'expo-audio';
import { useAudioPlayer } from "expo-audio"
import apiClient from "../api/client";
import { prefetch } from "expo-router/build/global-state/routing";

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
    const [currentUrl, setCurrentUrl] = useState("")
    const isChangingTrack = useRef(false)
    const prefetchedData = useRef<{ index: number, url: string } | null>(null)
    const isPrefetching = useRef(false)

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

    const calculate_next_index = () => {
        if (isShuffle) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * currentQueue.length);
            } while (nextIndex === currentIndex && currentQueue.length > 1);
            return nextIndex
        }
        return (currentIndex + 1) % currentQueue.length
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
        let targetIndex;
        if (prefetchedData.current) {
            targetIndex = prefetchedData.current.index;
        } else {
            targetIndex = calculate_next_index()
        }
        setCurrentIndex(targetIndex)
        playTrack(currentQueue[targetIndex])
    }

    const previous = () => {
        return
    }

    const playTrack = async (track: Track | PlaylistTracks) => {
        let url;
        if (prefetchedData.current?.url) {
            url = prefetchedData.current?.url
        } else {
            url = await get_stream_url(track.youtube_id)
        }
        if (!url) {
            setCurrentTrack(null)
            isChangingTrack.current = false
            isPrefetching.current = false
            prefetchedData.current = null
            return
        }
        isPrefetching.current = false
        setCurrentTrack(track)
        player.replace(url)
        play()
        isChangingTrack.current = false
        prefetchedData.current = null
    }

    const prefetchNextSong = async () => {
        if (isPrefetching.current || prefetchedData.current) return;
        let nextIndex = calculate_next_index()
        if (nextIndex >= currentQueue.length && !isShuffle) return;
        const nextTrack = currentQueue[nextIndex];
        try {
            const url = await get_stream_url(nextTrack.youtube_id);
            if (url) {
                prefetchedData.current = { "index": nextIndex, url };
            }
        } catch (error) {
            console.error("Error precargando la siguiente canción", error);
        } finally {
            isPrefetching.current = false;
        }

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

    useEffect(() => {
        const subscription = player.addListener("playbackStatusUpdate", () => {
            setCurrentTime(player.currentTime);
            if (player.playing !== isPlaying) {
                setIsPlaying(player.playing);
            }
            if (player.duration && player.currentTime >= player.duration) {
                if (!isChangingTrack.current) {
                    next();
                }
            }
            if (isPlaying && player.duration && player.duration > 0) {
                if ((player.duration - player.currentTime < 15) && !isPrefetching.current && !prefetchedData.current) {
                    prefetchNextSong();
                }
            }
        });

        return () => subscription.remove();
    }, [player, isPlaying, currentIndex, currentQueue, isShuffle]);
    useEffect(() => {
        const configureBackgroundAudio = async () => {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true, // Esto es lo que hace la magia
                });
            } catch (error) {
                console.error("Error configurando el audio en segundo plano", error);
            }
        };

        configureBackgroundAudio();
    }, []);

    return (
        <PlayerContext.Provider value={{ play, pause, next, previous, isPlaying, currentTime, playTrack, currentTrack, playPlaylist, toogleShuffle, playlistId }}>
            {children}
        </PlayerContext.Provider>

    )
}