import { supabase } from "@/utils/supabase";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TouchableHighlight, View } from "react-native";
import Toast from "react-native-toast-message";
import CustomText from "./CustomText";
import FullPageModal from "./FullPageModal";
import LargeSolidButton from "./LargeSolidButton";
import RoundedNumericalInput from "./RoundedNumericalInput";

type props = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
};

export default function OtpModal({ isVisible, setIsVisible, email }: props) {
  const [otp, setOtp] = useState<string>("");
  const router = useRouter();

  const handleVerification = async () => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });
    if (error) {
      console.log(error);
      Toast.show({ type: "error", text1: error.message });
      setOtp("");
      return;
    }
    router.push("/(tabs)/profile");
  };

  const resendOTP = async () => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    Toast.show({ type: "success", text1: "A new OTP has been sent" });

    if (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Please wait a while before resending",
      });
      return;
    }
  };

  return (
    <FullPageModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      title=''
      showBorder={false}
    >
      <View className='flex-1 justify-center items-center p-8 gap-32'>
        <View className='items-center gap-4'>
          <Image
            source={require("../../assets/images/security.svg")}
            style={{
              width: 96,
              height: 96,
            }}
            contentFit='cover'
          />

          <CustomText className='text-2xl font-poppins-bold '>
            Verification
          </CustomText>
          <View className='items-center'>
            <CustomText className='text-sm'>An OTP as been sent to</CustomText>
            <CustomText className=' text-primary-700 text-sm'>
              {email}
            </CustomText>
          </View>
        </View>
        <View className='w-full items-center gap-2'>
          <RoundedNumericalInput
            value={otp}
            onChangeText={setOtp}
            placeholder='Enter code'
            textAlign='center'
            className='mb-4'
          />
          <LargeSolidButton buttonText='Verify' onPress={handleVerification} />
          <View className='flex-row'>
            <CustomText className='text-sm'>
              Didn't receive the verification OTP?{" "}
            </CustomText>
            <TouchableHighlight className=''>
              <CustomText
                className='text-primary-700 text-sm'
                onPress={resendOTP}
              >
                Resend OTP
              </CustomText>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    </FullPageModal>
  );
}
