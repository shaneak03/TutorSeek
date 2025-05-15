import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const Login = () => {
  const textColor = useColorScheme() === "dark" ? "green" : "black";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Add login logic here
    console.log("Username:", username);
    console.log("Password:", password);
    setPassword("");
    setUsername("");
  };

  return (
    <View className='flex-1 justify-center items-center'>
      <Text className='text-5xl text-primary bottom-4'>Login</Text>
      <TextInput
        className='w-64 h-12 px-4 border border-gray-300 rounded-lg text-base text-primary m-2'
        placeholder='Username'
        placeholderTextColor='gray'
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        className='w-64 h-12 px-4 border border-gray-300 rounded-lg text-base text-primary m-2'
        placeholder='Password'
        placeholderTextColor='gray'
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        className='bg-blue-500 px-6 py-3 rounded-lg m-2'
        onPress={handleLogin}
      >
        <Text className='text-red-200xl text-primary'>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
