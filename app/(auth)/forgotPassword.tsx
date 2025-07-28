import { supabase } from "@/utils/supabase";
import { useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import CustomText from "../components/CustomText";
import LargeSolidButton from "../components/LargeSolidButton";
import RoundTextInput from "../components/RoundedTextInput";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");

  const sendLink = async () => {
    let { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "tutorseek://",
    });
    if (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please wait a while before sending another link",
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Reset Link Sent",
        text2: "Please check your email to reset your password.",
      });
    }
  };

  return (
    <View className='flex-1 justify-center items-center px-8 bg-neutral-100 gap-4'>
      <CustomText>Send a reset link to your email</CustomText>
      <RoundTextInput
        value={email}
        onChangeText={value => setEmail(value)}
        placeholder='Enter your email'
        textAlign='center'
      />

      <LargeSolidButton
        buttonText='Send reset link'
        onPress={sendLink}
        className='bg-primary-700 text-white'
      />
      <CustomText className='text-center text-sm px-4'>
        <CustomText className='text-sm text-primary-700 font-poppins-semibold'>
          Important:{" "}
        </CustomText>
        Kindly access your email using the same device this app is installed on
      </CustomText>
    </View>
  );
};

export default ForgotPasswordScreen;
