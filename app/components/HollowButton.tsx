import { Text, TouchableOpacity } from "react-native";
import { twMerge } from "tailwind-merge";

const HollowButton = ({
  buttonText,
  onPress,
  className,
  inactive = false,
}: {
  buttonText: string;
  onPress: any;
  className?: string;
  inactive?: boolean;
}) => {
  const borderColor = inactive ? "border-neutral-300" : " border-primary-700";
  const textColor = inactive ? "text-neutral-900" : " text-primary-700";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={twMerge(
        "rounded-[48] px-4 py-1 border-2 first-letter " + borderColor,
        className
      )}
      onPress={onPress}
    >
      <Text className={"text-center font-poppins-semibold " + textColor}>
        {buttonText}
      </Text>
    </TouchableOpacity>
  );
};

export default HollowButton;
