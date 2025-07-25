import { Stack } from "expo-router";
import themeColors from "../themeColors";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColors["neutral-100"],
        },
        headerTitleStyle: { fontFamily: "Poppins_600SemiBold" },
        headerTintColor: themeColors["neutral-900"], //text/icons
        headerShadowVisible: false, // removes the bottom border
      }}
    >
      <Stack.Screen name='login' options={{ headerShown: false }} />
      <Stack.Screen name='register' options={{ headerShown: false }} />
      <Stack.Screen name='forgotPassword' options={{ title: "" }} />
      <Stack.Screen
        name='changePassword'
        options={{ title: "Change Password" }}
      />
    </Stack>
  );
};

export default Layout;
