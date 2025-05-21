import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import CustomText from "./components/CustomText";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.log(error);
    } else {
      router.push("/(tabs)");
    }
  };

  return (
    <View className='flex-1 justify-center items-center'>
      <CustomText className='font-bold'>Login</CustomText>
      <TextInput
        className='w-64 h-12 px-4 border border-gray-300 rounded-lg text-base text-primary m-2'
        placeholder='Username'
        placeholderTextColor='gray'
        value={email}
        onChangeText={setEmail}
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
