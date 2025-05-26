import { Text, TextProps } from "react-native";
import { twMerge } from "tailwind-merge";

export default function CustomText({
  children,
  className,
  ...props
}: {
  children: any;
  className?: string;
} & TextProps) {
  return (
    <Text
      className={twMerge(
        "text-base font-poppins text-neutral-900 leading-normal ",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
}
