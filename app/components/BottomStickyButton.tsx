import { View } from "react-native";
import LargeSolidButton from "./LargeSolidButton";

type props = {
  text: string;
  onPress: any;
};

const BottomSticyButton = ({ text, onPress }: props) => {
  return (
    <View className='flex justify-center items-center border-neutral-300 border-t-hairline p-4 absolute w-full bottom-0'>
      <LargeSolidButton buttonText={text} onPress={onPress} />
    </View>
  );
};

export default BottomSticyButton;
