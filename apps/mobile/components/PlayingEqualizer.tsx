import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export default function PlayingEqualizer() {
    // 1. Creamos tres "notas" en el bolsillo (useRef) para la altura de cada barra
    const bar1 = useRef(new Animated.Value(4)).current;
    const bar2 = useRef(new Animated.Value(12)).current;
    const bar3 = useRef(new Animated.Value(6)).current;

    // 2. Función que hace rebotar una barra infinitamente
    const animateBar = (animValue: Animated.Value, min: number, max: number, speed: number) => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animValue, {
                    toValue: max,
                    duration: speed,
                    useNativeDriver: false, // La altura no soporta el driver nativo puro, pero al ser tan pequeño no afecta
                }),
                Animated.timing(animValue, {
                    toValue: min,
                    duration: speed + 50, // Pequeño desfase al bajar para que parezca más orgánico
                    useNativeDriver: false,
                }),
            ])
        ).start();
    };

    // 3. Arrancamos las animaciones al montar el componente con velocidades distintas
    useEffect(() => {
        animateBar(bar1, 4, 16, 350);
        animateBar(bar2, 6, 20, 280);
        animateBar(bar3, 4, 14, 400);
    }, []);

    return (
        <View className="flex-row items-end justify-center h-5 w-5 gap-1">
            <Animated.View style={{ height: bar1 }} className="w-1 bg-fuchsia-500 rounded-full" />
            <Animated.View style={{ height: bar2 }} className="w-1 bg-fuchsia-500 rounded-full" />
            <Animated.View style={{ height: bar3 }} className="w-1 bg-fuchsia-500 rounded-full" />
        </View>
    );
}