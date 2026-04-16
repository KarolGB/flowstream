import baseConfig from "./app.json";

export default {
  ...baseConfig.expo,
  name: process.env.APP_ENV === "production" ? "FlowStream" : "FlowStream-Dev",
  slug: process.env.APP_ENV === "production" ? "FlowStream" : "FlowStream-Dev",
  ios: {
    ...baseConfig.expo.ios,
    bundleIdentifier: process.env.APP_ENV === "production"
      ? "com.flowstream"
      : "com.flowstream.dev"
  },
  android: {
    ...baseConfig.expo.android,
    package: process.env.APP_ENV === "production"
      ? "com.flowstream"
      : "com.flowstream.dev"
  }
}