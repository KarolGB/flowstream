import { createContext, useContext, ReactNode, useState, useEffect, useRef } from "react";
import { setAudioModeAsync } from 'expo-audio';
import { useAudioPlayer, AudioPlayer } from "expo-audio"
import apiClient from "../api/client";
import { MediaControl, Command, PlaybackState, MediaControlEvent } from 'expo-media-control';

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
    playTrack: (track: Track) => void;
    currentTrack: Track | PlaylistTracks | null;
    playPlaylist: (id: string | string[], tracks: PlaylistTracks[], startIndex: number) => void;
    toogleShuffle: () => void;
    playlistId: string | string[] | null;
    isLoading: boolean;
    player: AudioPlayer;

}

const PlayerContext = createContext<PlayerContextType>({
    play: () => { },
    pause: () => { },
    next: () => { },
    previous: () => { },
    isPlaying: false,
    playTrack: (track: Track) => { },
    currentTrack: null,
    playPlaylist: (id: string | string[], tracks: PlaylistTracks[], startIndex: number) => { },
    toogleShuffle: () => { },
    playlistId: null,
    isLoading: false,
    player: {} as AudioPlayer
});


export const usePlayer = () => {
    return useContext(PlayerContext)
}

export const PlayerProvider = ({ children }: { children: ReactNode }) => {

    const [isPlaying, setIsPlaying] = useState(false);
    const [playlistId, setPlaylistId] = useState<string | string[] | null>(null)
    const [currentQueue, setCurrentQueue] = useState<Track[] | PlaylistTracks[]>([])
    const [currentTrack, setCurrentTrack] = useState<Track | null | PlaylistTracks>(null);
    const [isShuffle, setIsShuffle] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const previousTracks = useRef<number[]>([])
    const isChangingTrack = useRef(false)
    const prefetchedData = useRef<{ index: number, url: string, video_id: string } | null>(null)
    const isPrefetching = useRef(false)

    const toogleShuffle = () => setIsShuffle(!isShuffle)
    const player = useAudioPlayer("", {
        updateInterval: 1000
    });

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
        setIsPlaying(true)
        MediaControl.updatePlaybackState(PlaybackState.PLAYING);
        player.play()
    }

    const pause = () => {
        setIsPlaying(false)
        MediaControl.updatePlaybackState(PlaybackState.PAUSED);
        player.pause()
    }

    const next = async () => {
        previousTracks.current.push(currentIndex);
        if (currentQueue.length === 0) return;
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
        if (player.currentTime > 3) {
            player.seekTo(0)
            return
        }
        let targetIndex;
        if (previousTracks.current.length > 0) {
            targetIndex = previousTracks.current.pop()!;
            setCurrentIndex(targetIndex)
            playTrack(currentQueue[targetIndex])
        }
    }

    const actionsRef = useRef({ play, pause, next, previous });
    useEffect(() => {
        actionsRef.current = { play, pause, next, previous };
    });

    const playTrack = async (track: Track | PlaylistTracks) => {
        setCurrentTrack(track)
        setIsLoading(true)
        player.seekTo(0)
        pause()
        let url;
        if (prefetchedData.current?.url && prefetchedData.current.video_id === track.youtube_id) {
            url = prefetchedData.current?.url
        } else {
            url = await get_stream_url(track.youtube_id)
        }
        if (!url) {
            setCurrentTrack(null)
            isChangingTrack.current = false
            isPrefetching.current = false
            prefetchedData.current = null
            setIsLoading(false)
            return
        }
        isPrefetching.current = false
        player.replace(url)
        MediaControl.updateMetadata({
            title: track.title,
            artist: track.artist,
            artwork: {
                uri: track.thumbnail
            },
            duration: track.duration_seconds
        });
        play()
        isChangingTrack.current = false
        prefetchedData.current = null
        setIsLoading(false)
    }

    const prefetchNextSong = async () => {
        if (isPrefetching.current || prefetchedData.current) return;
        isPrefetching.current = true;
        let nextIndex = calculate_next_index()
        if (nextIndex >= currentQueue.length && !isShuffle) return;
        const nextTrack = currentQueue[nextIndex];
        try {
            const url = await get_stream_url(nextTrack.youtube_id);
            if (url) {
                prefetchedData.current = { "index": nextIndex, "url": url, "video_id": nextTrack.youtube_id };
            }
        } catch (error) {
            console.error("Error precargando la siguiente canción", error);
        } finally {
            isPrefetching.current = false;
        }

    }

    const playPlaylist = (id: string | string[], tracks: PlaylistTracks[], startIndex = -1) => {
        if (tracks.length === 0) return;
        if (id === playlistId && isPlaying && startIndex === -1) {
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
        if (isShuffle && startIndex === -1) {
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
            if (player.duration && player.currentTime >= player.duration) {
                if (!isChangingTrack.current) {
                    actionsRef.current.next();
                }
            }
            if (player.playing && player.duration && player.duration > 0) {
                if ((player.currentTime > 1) && !isPrefetching.current && !prefetchedData.current && currentQueue.length > 1) {
                    console.log("Prefetching next song...");
                    prefetchNextSong();
                }
            }
        });

        return () => subscription.remove();
    }, [player]);
    useEffect(() => {
        const configureBackgroundAudio = async () => {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    shouldPlayInBackground: true,
                    interruptionMode: "doNotMix"
                });
            } catch (error) {
                console.error("Error configurando el audio en segundo plano", error);
            }
        };

        configureBackgroundAudio();
    }, []);

    useEffect(() => {
        const initializeControls = async () => {
            try {
                await MediaControl.enableMediaControls({
                    capabilities: [
                        Command.PLAY,
                        Command.PAUSE,
                        Command.NEXT_TRACK,
                        Command.PREVIOUS_TRACK,
                    ],
                    compactCapabilities: [
                        Command.PREVIOUS_TRACK,
                        Command.PLAY,
                        Command.NEXT_TRACK,
                    ],
                    notification: {
                        icon: 'ic_music_note',
                        color: '#1976D2',
                    },
                });

            } catch (error) {
                console.error('Failed to initialize media controls:', error);
            }
        };

        initializeControls();

        const removeListener = MediaControl.addListener((event: MediaControlEvent) => {
            console.log('Media control event:', event.command);

            switch (event.command) {
                case Command.PLAY:
                    actionsRef.current.play();
                    break;
                case Command.PAUSE:
                    actionsRef.current.pause();
                    break;
                case Command.NEXT_TRACK:
                    actionsRef.current.next();
                    break;
                case Command.PREVIOUS_TRACK:
                    actionsRef.current.previous();
                    break;
            }
        });

        return () => {
            removeListener();
            MediaControl.disableMediaControls();
        };
    }, []);

    return (
        <PlayerContext.Provider value={{ play, pause, next, previous, isPlaying, playTrack, currentTrack, playPlaylist, toogleShuffle, playlistId, isLoading, player }}>
            {children}
        </PlayerContext.Provider>

    )
}
