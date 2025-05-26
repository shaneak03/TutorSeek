import { TextInput, TextInputProps } from "react-native";
import themeColors from "../themeColors";

const RoundTextInput = ({
  value,
  onChangeText,
  placeholder,
  ...props
}: {
  value: string;
  onChangeText: any;
  placeholder: string;
} & TextInputProps) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      className='bg-neutral-200 rounded-3xl font-poppins p-4 w-full'
      placeholderTextColor={themeColors["neutral-300"]}
      {...props}
    />
  );
};

export default RoundTextInput;
