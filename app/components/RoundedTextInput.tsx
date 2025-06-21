import { TextInput, TextInputProps, View } from "react-native";
import themeColors from "../themeColors";
import CustomText from "./CustomText";

type props = {
  value: string;
  onChangeText: any;
  placeholder: string;
  isEditing?: boolean;
  mutliline?: boolean;
  borderRadius?: number;
};

const RoundTextInput = ({
  value,
  onChangeText,
  placeholder,
  isEditing = true,
  multiline = false,
  borderRadius = 48,
  ...props
}: props & TextInputProps) => {
  return isEditing ? (
    <TextInput
      value={value}
      multiline={multiline}
      onChangeText={onChangeText}
      placeholder={placeholder}
      className={`bg-neutral-200 rounded-[${borderRadius}] font-poppins p-4 w-full leading-normal`}
      placeholderTextColor={themeColors["neutral-300"]}
      {...props}
    />
  ) : (
    <View className={`bg-neutral-200 rounded-[${borderRadius}] p-4 w-full`}>
      <CustomText>{value}</CustomText>
    </View>
  );
};

export default RoundTextInput;
