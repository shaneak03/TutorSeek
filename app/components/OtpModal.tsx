import { Image } from "expo-image";
import { Modal, View } from "react-native";
import CustomText from "./CustomText";

type props = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function OtpModal({ isVisible, setIsVisible }: props) {
  return (
    <Modal visible={isVisible}>
      <View className='flex-1 justify-center items-center'>
        <Image
          source={require("../../assets/images/security.svg")}
          style={{
            width: 96,
            height: 96,
          }}
          contentFit='cover'
        />
        <CustomText className='text-xl font-poppins-semibold'>
          Verification
        </CustomText>
        <CustomText>An OTP as been sent to your </CustomText>
      </View>
    </Modal>
  );
}
