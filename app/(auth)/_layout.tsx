import { Stack } from "expo-router";
import themeColors from "../themeColors";

const Layout = () => {
  return (
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
      <Stack.Screen name='forgotPassword' options={{ title: "" }} />
    </Stack>
  );
};

export default Layout;
