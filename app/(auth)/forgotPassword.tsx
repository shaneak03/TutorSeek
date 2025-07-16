import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import CustomText from "../components/CustomText";
import LargeSolidButton from "../components/LargeSolidButton";
import RoundTextInput from "../components/RoundedTextInput";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const sendLink = async () => {
    let { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      console.log(error);
    } else {
      Toast.show({
        type: "success",
        text1: "Reset Link Sent",
        text2: "Please check your email to reset your password.",
      });
      router.push("/login");
    }
  };

  return (
    <View className='flex-1 justify-center items-center px-8 bg-neutral-100 gap-4'>
      <CustomText>Send a reset link to your email</CustomText>
      <RoundTextInput
        value={email}
        onChangeText={value => setEmail(value)}
        placeholder='Enter your email'
      ></RoundTextInput>
      <LargeSolidButton
        buttonText="Send reset link"
        onPress={sendLink}
        className="bg-primary-700 text-white"
      ></LargeSolidButton>
    </View>
  );
};

export default ForgotPasswordScreen;
