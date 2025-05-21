import React from 'react';
import { Text, useColorScheme, View } from 'react-native';

const Profile = () => {
  const textColor = useColorScheme() === "dark" ? "white" : "black";
  
  return (
    <View>
      <Text style={{ color: textColor }}>Profile</Text>
    </View>
  )
}

export default Profile
