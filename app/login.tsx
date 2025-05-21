import { supabase } from "@/utils/supabase";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import CustomText from "./components/CustomText";
import RoundTextInput from "./components/RoundedInput";

const imageWidth = Dimensions.get("window").width - 64;

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
    <View className='flex flex-col justify-center items-center gap-4 px-8 bg-neutral-100'>
      <Image
        source={require("../assets/images/auth-image.svg")}
        style={{ width: imageWidth, height: 300 }}
        contentFit='cover'
      />
      <View>
        <CustomText className='text-2xl font-poppins-bold'>
          <Text> Register as </Text>
          <Text className='text-primary-700'>tutor</Text>
        </CustomText>
      </View>

      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>Email</CustomText>
        <RoundTextInput
          text={email}
          onChangeText={setEmail}
          placeholder='Enter your email'
        />
      </View>
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>Email</CustomText>
        <RoundTextInput
          text={password}
          onChangeText={setPassword}
          placeholder='Enter your password'
        />
      </View>
      <TouchableOpacity
        className='bg-blue-500 px-6 py-3 rounded-lg m-2 w-full'
        onPress={handleLogin}
      >
        <Text className=''>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
