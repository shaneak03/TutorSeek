import 'dotenv/config';

export default {
  expo: {
    name: "TutorSeek",
    slug: "TutorSeek",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/TutorSeek-logo.png",
    scheme: "tutorseek",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      icon: "./assets/images/TutorSeek-logo.png",
      supportsTablet: true,
      bundleIdentifier: "com.shaneak03.TutorSeek",
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ["tutorseek"]
          }
        ],
        LSApplicationQueriesSchemes: ["googlechrome", "googlechromes"]
      }
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/TutorSeek-logo.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.shaneak03.TutorSeek",
      versionCode: 1,
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "tutorseek",
              host: "auth",
              pathPrefix: "/callback"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/TutorSeek-logo.png"
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/TutorSeek-logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static"
          }
        }
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: "com.googleusercontent.apps.176743680156-re5uumu2bi6bhucnrk6r1ndcpro0l908"
        }
      ],
      "expo-web-browser"
    ],

    experiments: {
      typedRoutes: true
    },

    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "a758d76d-ba56-49b4-b7d9-786b02ad94f4"
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
};
