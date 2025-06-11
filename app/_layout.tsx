import { supabase } from "@/utils/supabase";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import { createContext, useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SubjectContextProvider from "./contexts/subjectContext";
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
    <>
      <StatusBar
        backgroundColor={themeColors["neutral-100"]}
        barStyle={"dark-content"}
      />
      <SubjectContextProvider>
        <AuthContext value={{ user, setUser }}>
          <SafeAreaProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name='(tabs)' />
              <Stack.Screen name='(auth)' />
            </Stack>
          </SafeAreaProvider>
        </AuthContext>
      </SubjectContextProvider>
    </>
  );
}
