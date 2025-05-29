import { TextInput, TextInputProps, View } from "react-native";
import themeColors from "../themeColors";
import CustomText from "./CustomText";

const RoundTextInput = ({
  value,
  onChangeText,
  placeholder,
  isEditing = true,
  ...props
}: {
  value: string;
  onChangeText: any;
  placeholder: string;
  isEditing?: boolean;
} & TextInputProps) => {
  return isEditing ? (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      className='bg-neutral-200 rounded-[48] font-poppins p-4 w-full leading-normal'
      placeholderTextColor={themeColors["neutral-300"]}
      {...props}
    />
  ) : (
    <View className='bg-neutral-200 rounded-[48] p-4 w-full'>
      <CustomText>{value}</CustomText>
    </View>
  );
};

export default RoundTextInput;
