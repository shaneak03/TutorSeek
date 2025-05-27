import 'dotenv/config';

export default {
  expo: {
    name: "TutorSeek",
    slug: "TutorSeek",
    version: "1.0.0",
    userInterfaceStyle: "automatic",
    scheme: "tutorseek",
    owner: "shaneak03",
    icon: "./assets/images/TutorSeek-logo.png", // General icon (used for iOS too)
    ios: {
      icon: "./assets/images/TutorSeek-logo.png",
      supportsTablet: true
    },
    android: {
      package: "com.shaneak03.TutorSeek",
      adaptiveIcon: {
        foregroundImage: "./assets/images/TutorSeek-logo.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      versionCode: 1
    },
    web: {
      favicon: "./assets/images/TutorSeek-logo.png"
    },
    extra: {
      // These values come from your .env file or from environment variables set in Expo dashboard or eas.json
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "a758d76d-ba56-49b4-b7d9-786b02ad94f4"
      }
    },
    plugins: [
      "expo-router"
    ]
  }
};
