import { Entypo, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useContext } from "react";
import { TouchableOpacity } from "react-native";
import { AuthContext } from "../_layout";
import LoginModal from "../components/LoginModal";
import themeColors from "../themeColors";

const MyCustomTabButton = ({ children, onPress }: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className='flex-1 justify-center items-center '
    >
      {children}
    </TouchableOpacity>
  );
};

const Layout = () => {
  const { authUser } = useContext(AuthContext);
  if (!authUser) return <LoginModal />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors["primary-700"],
        tabBarInactiveTintColor: themeColors["neutral-900"],
        tabBarStyle: {
          backgroundColor: themeColors["neutral-100"],
          borderColor: themeColors["neutral-300"],
          elevation: 0, // removes shadow on Android
          shadowOpacity: 0, // removes shadow on iOS
        },
        headerShown: false,
        tabBarButton: props => <MyCustomTabButton {...props} />,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='home' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='chat'
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='chatbubble' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='schedule'
        options={{
          headerShown: true,
          headerTitleStyle: {
            fontFamily: "Poppins_700Bold",
            fontSize: 24,
          },
          title: "Schedule",
          tabBarIcon: ({ color, size }) => (
            <Entypo name='book' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='person' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default Layout;
