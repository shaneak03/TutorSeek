import toastConfig from "@/utils/toastConfig";
import { AntDesign } from "@expo/vector-icons";
import { Modal, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import themeColors from "../themeColors";
import CustomText from "./CustomText";

type props = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  children?: React.ReactNode;
};

const FullPageModal = ({ isVisible, setIsVisible, title, children }: props) => {
  return (
    <Modal visible={isVisible} animationType='slide' statusBarTranslucent>
      <SafeAreaView className='flex-1 bg-neutral-100'>
        <View className='flex items-center justify-center relative py-4 border-b-hairline border-neutral-300'>
          <CustomText className='font-poppins-bold text-2xl'>
            {title}
          </CustomText>
          <TouchableOpacity
            className='absolute self-start rounded-full p-4'
            onPress={() => setIsVisible(false)}
          >
            <AntDesign
              name='arrowleft'
              size={20}
              color={themeColors["neutral-900"]}
            />
          </TouchableOpacity>
        </View>
        {children}
      </SafeAreaView>
      <Toast config={toastConfig} visibilityTime={2500} />
    </Modal>
  );
};

export default FullPageModal;
