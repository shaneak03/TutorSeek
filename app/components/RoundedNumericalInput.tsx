import { TextInput, TextInputProps, View } from "react-native";
import { twMerge } from "tailwind-merge";
import themeColors from "../themeColors";
import CustomText from "./CustomText";

interface RoundedNumericalInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  isEditing?: boolean;
  className?: string;
}

const RoundedNumericalInput = ({
  value,
  onChangeText,
  placeholder,
  isEditing = true,
  className,
  ...props
}: RoundedNumericalInputProps) => {
  const handleChangeText = (text: string) => {
    const filtered = text.replace(/[^0-9]/g, "");
    onChangeText(filtered);
  };

  return isEditing ? (
    <TextInput
      value={value}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      keyboardType='number-pad'
      className={twMerge(
        "bg-neutral-200 rounded-[48] font-poppins p-4 w-full leading-normal",
        className
      )}
      placeholderTextColor={themeColors["neutral-300"]}
      {...props}
    />
  ) : (
    <View className='bg-neutral-200 rounded-[48] p-4 w-full'>
      <CustomText>{value}</CustomText>
    </View>
  );
};

export default RoundedNumericalInput;
