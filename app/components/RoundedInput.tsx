import { TextInput } from "react-native";
import themeColors from "../themeColors";

const RoundTextInput = ({
  text,
  onChangeText,
  placeholder,
}: {
  text: string;
  onChangeText: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
}) => {
  return (
    <TextInput
      className='bg-neutral-200 rounded-3xl font-poppins p-4 w-full'
      placeholder={placeholder}
      placeholderTextColor={themeColors["neutral-300"]}
      value={text}
      onChangeText={onChangeText}
    />
  );
};

export default RoundTextInput;
