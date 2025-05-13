import React from 'react';
import { Text, useColorScheme, View } from 'react-native';

const profile = () => {
  const textColor = useColorScheme() === "dark" ? "white" : "black";
  
  return (
    <View>
      <Text style={{ color: textColor }}>Profile</Text>
    </View>
  )
}

export default profile
