import { Stack } from "expo-router";
import themeColors from "../../themeColors";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColors["neutral-100"],
        },
        headerTintColor: themeColors["neutral-900"], //text/icons
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: "Poppins_700Bold",
          fontSize: 20,
          color: themeColors["primary-700"],
        },
      }}
    >
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='viewTutor' options={{ title: "Tutor" }} />
    </Stack>
  );
};

export default Layout;
