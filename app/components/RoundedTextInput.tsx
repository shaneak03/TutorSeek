import { TextInput } from "react-native";
import themeColors from "../themeColors";


const RoundTextInput = ({
  ...props
}) => {
  return (
    <TextInput
      className='bg-neutral-200 rounded-3xl font-poppins p-4 w-full'
      placeholderTextColor={themeColors["neutral-300"]}
      {...props}
    />
  );
};

export default RoundTextInput;
