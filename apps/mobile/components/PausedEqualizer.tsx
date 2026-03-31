import React from 'react';
import { View } from 'react-native';

export default function PausedEqualizer() {
    return (
        /* Usamos flex-row items-end para alinear las barras abajo.
           Mismo tamaño (h-5 w-5) y separación (gap-1) que el animado 
           para que no haya saltos visuales al cambiar de estado.
        */
        <View className="flex-row items-end justify-center h-5 w-5 gap-1">
            <View className="w-1 h-2 bg-fuchsia-500 rounded-full" />

            <View className="w-1 h-1 bg-fuchsia-500 rounded-full" />

            <View className="w-1 h-3 bg-fuchsia-500 rounded-full" />
        </View>
    );
}