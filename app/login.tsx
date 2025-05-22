import { supabase } from "@/utils/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "./components/CustomText";
import LargeSolidButton from "./components/LargeSolidButton";
import RoundTextInput from "./components/RoundedTextInput";
import themeColors from "./themeColors";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTutor, setIsTutor] = useState(false);
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

  const handleForgetPw = () => {
    //TODO
  };

  const handleGoogleAuth = () => {
    //TODO
  };

  const navToRegister = () => {
    router.push("/register");
  };

  return (
    <SafeAreaView className='flex-1 justify-center items-center gap-4 px-8 bg-neutral-100'>
      <Image
        source={require("../assets/images/auth-image.svg")}
        style={{ width: 250, height: 200 }}
        contentFit='cover'
      />
      <View className='w-full flex-row items-center gap-2'>
        <CustomText className='font-poppins-bold text-2xl'>
          <Text> Login as </Text>
          <Text className='text-primary-700'>
            {isTutor ? "tutor" : "student"}
          </Text>
        </CustomText>
        <TouchableOpacity activeOpacity={0.8}>
          <MaterialIcons
            name='keyboard-arrow-down'
            size={24}
            color={themeColors["neutral-300"]}
          />
        </TouchableOpacity>
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
        <CustomText className='font-poppins-semibold mb-2'>Password</CustomText>
        <RoundTextInput
          text={password}
          onChangeText={setPassword}
          placeholder='Enter your password'
        />
      </View>
      <Text
        onPress={handleForgetPw}
        className='w-full text-right font-poppins-semibold text-sm color-neutral-900'
      >
        Forgot password?
      </Text>
      <LargeSolidButton
        buttonText='Login'
        onPress={handleLogin}
        className='mt-2'
      />
      <View className='w-full relative flex justify-center items-center px-4'>
        <View className='h-[1] w-full bg-neutral-900 absolute'></View>
        <CustomText className='text-sm bg-neutral-100 px-4'>
          Or login with
        </CustomText>
      </View>
      <TouchableHighlight
        onPress={handleGoogleAuth}
        className='w-full flex-row justify-center rounded-[48] border-2 border-neutral-300 p-4'
        underlayColor={themeColors["neutral-200"]}
      >
        <Image
          source={require("../assets/images/google.svg")}
          style={{ width: 24, height: 24 }}
          contentFit='cover'
        />
      </TouchableHighlight>

      <Pressable onPress={navToRegister}>
        <CustomText className='text-sm'>
          <Text>Don't have an account? </Text>
          <Text className='text-primary-700'>Register</Text>
        </CustomText>
      </Pressable>
    </SafeAreaView>
  );
};

export default Login;
