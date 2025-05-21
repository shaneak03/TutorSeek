import React from "react";
import { Text, useColorScheme, View } from "react-native";

const Chat = () => {
  const textColor = useColorScheme() === "dark" ? "white" : "black";
  return (
    <View>
      <Text style={{ color: textColor }}>Chat</Text>
    </View>
  );
};

export default Chat;
