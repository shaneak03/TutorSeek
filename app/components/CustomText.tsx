import { Text } from "react-native";
import { twMerge } from "tailwind-merge";

export default function CustomText({
  children,
  className,
  ...props
}: {
  children: any;
  className?: string;
}) {
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
