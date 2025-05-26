import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import themeColors from "./themeColors";

export default function RootLayout() {
  useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: themeColors["neutral-100"],
          },
          headerTintColor: themeColors["neutral-900"], //text/icons
          headerShadowVisible: false, // removes the bottom border
        }}
      >
        <Stack.Screen name='login' options={{ headerShown: false }} />
        <Stack.Screen name='register' options={{ headerShown: false }} />
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='forgotPassword' options={{ title: "" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
