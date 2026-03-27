module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // 1. El preset de Expo modificado para que entienda las clases de Tailwind
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      // 2. NativeWind ahora vive aquí, en los presets
      "nativewind/babel",
    ],
    // El array de plugins lo dejamos vacío (o lo borramos) si no usas nada más
    plugins: [],
  };
};