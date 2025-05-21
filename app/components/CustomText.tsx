import { Text } from "react-native";

export default function CustomText({
  children,
  className,
}: {
  children: any;
  className?: string;
}) {
  return (
    <Text className={"font-poppins text-neutral-900 " + className}>
      {children}
    </Text>
  );
}
