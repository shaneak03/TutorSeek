import { supabase } from "@/utils/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "./components/CustomText";
import LargeSolidButton from "./components/LargeSolidButton";
import RoundTextInput from "./components/RoundedTextInput";
import themeColors from "./themeColors";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTutor, setIsTutor] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
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

  const handleGoogleAuth = () => {
    //TODO
  };

  const navToLogin = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView className='flex-1 justify-center items-center gap-4 px-8 bg-neutral-100'>
      <Image
        source={require("../assets/images/auth-image.svg")}
        style={{ width: 240, height: 180 }}
        contentFit='cover'
      />
      <View className='w-full flex-row items-center gap-2'>
        <CustomText className='font-poppins-bold text-2xl'>
          <Text>Register as </Text>
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
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>
          Confirm password
        </CustomText>
        <RoundTextInput
          text={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder='Enter your password'
        />
      </View>
      <LargeSolidButton
        buttonText={"Register"}
        onPress={handleRegister}
        className='mt-2'
      />
      <View className='w-full relative flex justify-center items-center px-4'>
        <View className='h-[1] w-full bg-neutral-900 absolute'></View>
        <CustomText className='text-sm bg-neutral-100 px-4'>
          Or Register with
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
      <CustomText className='text-sm'>
        <Text>Already have an account? </Text>
        <Text className='text-primary-700' onPress={navToLogin}>
          Sign in
        </Text>
      </CustomText>
    </SafeAreaView>
  );
};

export default Register;
