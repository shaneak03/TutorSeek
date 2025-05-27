import { supabase } from "@/utils/supabase";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import { createContext, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import themeColors from "./themeColors";

export const AuthContext = createContext<any>(null);

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();
  }, []);

  useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  return (
    <AuthContext.Provider value={{ user, setUser }}>
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
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen name='login' options={{ headerShown: false }} />
          <Stack.Screen name='register' options={{ headerShown: false }} />
          <Stack.Screen name='forgotPassword' options={{ title: "" }} />
        </Stack>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}
