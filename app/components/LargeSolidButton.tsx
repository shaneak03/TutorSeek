import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { twMerge } from "tailwind-merge";

const LargeSolidButton = ({
  buttonText,
  onPress,
  className,
  textClassName,
  ...props
}: {
  buttonText: string;
  onPress: any;
  className?: string;
  textClassName?: string;
} & TouchableOpacityProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={twMerge("bg-primary-700 rounded-[48] p-4 w-full", className)}
      onPress={onPress}
      {...props}
    >
      <Text
        className={twMerge(
          "text-center font-poppins-semibold text-neutral-100",
          textClassName
        )}
      >
        {buttonText}
      </Text>
    </TouchableOpacity>
  );
};

export default LargeSolidButton;
