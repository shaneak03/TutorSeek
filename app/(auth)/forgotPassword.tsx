import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";
import CustomText from "../components/CustomText";
import LargeSolidButton from "../components/LargeSolidButton";
import RoundTextInput from "../components/RoundedTextInput";
import themeColors from "../themeColors";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendLink = async () => {
    if (loading) return;
    setLoading(true);
    let { error } = await supabase.auth.resetPasswordForEmail(email, {redirectTo: "tutorseek://"});
    if (error) {
      console.log(error);
      setLoading(false);
    } else {
      Toast.show({
        type: "success",
        text1: "Reset Link Sent",
        text2: "Please check your email to reset your password.",
      });
      setTimeout(() => {
        setLoading(false);
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <View className='flex-1 justify-center items-center px-8 bg-neutral-100 gap-4'>
      <CustomText>Send a reset link to your email</CustomText>
      <RoundTextInput
        value={email}
        onChangeText={value => setEmail(value)}
        placeholder='Enter your email'
      />
      {loading ? (
        <ActivityIndicator size="large" color={themeColors["primary-700"]}  />
      ) : (
        <LargeSolidButton
          buttonText="Send reset link"
          onPress={sendLink}
          className="bg-primary-700 text-white"
        />
      )}
    </View>
  );
};

export default ForgotPasswordScreen;
