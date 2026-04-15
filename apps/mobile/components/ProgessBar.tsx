import { useEffect, useState } from "react";
import { View } from "react-native";
import { usePlayer } from "../context/PlayerContext";

const ProgressBar = () => {
    const { player, currentTrack } = usePlayer()
    const [progress, setProgress] = useState(0)
    const duration = currentTrack?.duration_seconds || 1
    let progressPercentage = (progress / duration) * 100
    progressPercentage = Math.min(100, Math.max(0, progressPercentage));
    useEffect(() => {
        const subscription = player.addListener("playbackStatusUpdate", () => {
            setProgress(player.currentTime);
        });

        return () => subscription.remove();
    }, [player]);

    return (
        <View className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-800">
            <View
                className="h-full bg-fuchsia-500"
                style={{ width: `${progressPercentage}%` }}
            />
        </View>
    )

}
export default ProgressBar;