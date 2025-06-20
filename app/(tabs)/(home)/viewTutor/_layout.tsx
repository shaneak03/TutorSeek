import themeColors from "@/app/themeColors";
import { Stack } from "expo-router";

export default function ViewTutorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: themeColors["neutral-100"],
        },
        headerTitleStyle: {
          fontFamily: "Poppins_700Bold",
          color: themeColors["primary-700"],
          fontSize: 20,
        },
      }}
    >
      <Stack.Screen name={"[id]"} options={{ title: "Tutor" }} />
    </Stack>
  );
}
