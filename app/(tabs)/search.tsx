import React from 'react';
import { Text, useColorScheme, View } from 'react-native';

const search = () => {
  const textColor = useColorScheme() === "dark" ? "white" : "black";
  return (
    <View>
      <Text style={{ color: textColor }}>Search</Text>
    </View>
  )
}

export default search