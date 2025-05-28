import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";
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

const _layout = () => {
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
        tabBarButton: props => <MyCustomTabButton {...props} />,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='home' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='chat'
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='chatbubble' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='person' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
