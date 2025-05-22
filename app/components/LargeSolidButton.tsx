import { Text, TouchableOpacity } from "react-native";
import { twMerge } from "tailwind-merge";

const LargeSolidButton = ({
  buttonText,
  onPress,
  className,
}: {
  buttonText: string;
  onPress: any;
  className?: string;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={twMerge("bg-primary-700 rounded-[48] p-4 w-full ", className)}
      onPress={onPress}
    >
      <Text className='text-center font-poppins-semibold color-neutral-100'>
        {buttonText}
      </Text>
    </TouchableOpacity>
  );
};

export default LargeSolidButton;
