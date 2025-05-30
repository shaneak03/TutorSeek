import { supabase } from "@/utils/supabase";
import { useState } from "react";
import { View } from "react-native";
import CustomText from "../components/CustomText";
import LargeSolidButton from "../components/LargeSolidButton";
import RoundTextInput from "../components/RoundedTextInput";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [sentLink, setSentLink] = useState(false);
  const sendLink = async () => {
    let { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      console.log(error);
    } else {
      setSentLink(true);
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
        buttonText={!sentLink ? "Send reset link" : "Link sent"}
        onPress={sendLink}
      ></LargeSolidButton>
    </View>
  );
};

export default ForgotPasswordScreen;
