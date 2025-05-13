import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

const login = () => {
    const textColor = useColorScheme() === "dark" ? "white" : "black";
  return (
    <View>
      <Text style={{ color: textColor }}>login</Text>
    </View>
  )
}

export default login

const styles = StyleSheet.create({})