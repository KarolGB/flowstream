import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useAudioPlayer } from "expo-audio"

export interface Track {
    youtube_id: string; title: string; artist: string; thumbnail_url: string; url: string;
}

interface PlayerContextType {
    play: () => void;
    pause: () => void;
    next: () => void;
    previous: () => void;
    isPlaying: boolean;
    currentTime: number;
    playTrack: (track: Track) => void;
    currentTrack: Track | null;

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
});


export const usePlayer = () => {
    return useContext(PlayerContext)
}

export const PlayerProvider = ({ children }: { children: ReactNode }) => {

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);



    const player = useAudioPlayer("");

    useEffect(() => {
        console.log(isPlaying)
    }, [isPlaying])



    const play = () => {
        player.play()
        setIsPlaying(true)
        console.log("playing")
    }

    const pause = () => {
        player.pause()
        setIsPlaying(false)
    }

    const next = () => {
        console.log("next")
    }

    const previous = () => {
        console.log("previous")
    }

    const playTrack = (track: Track) => {
        setCurrentTrack(track)
        player.replace(track.url)
        play()
    }

    return (
        <PlayerContext.Provider value={{ play, pause, next, previous, isPlaying, currentTime: player.currentTime, playTrack, currentTrack }}>
            {children}
        </PlayerContext.Provider>

    )
}