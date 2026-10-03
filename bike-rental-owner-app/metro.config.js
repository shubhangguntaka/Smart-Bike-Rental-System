const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Limit worker count to prevent V8 Zone memory exhaustion on Node 22 / Windows
config.maxWorkers = 2;

module.exports = withNativeWind(config, { input: "./global.css" });
