const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Le decimos a Metro que use NativeWind y que nuestro archivo principal de CSS será global.css
module.exports = withNativeWind(config, { input: "./global.css" });