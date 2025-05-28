import { useRouter } from "expo-router";
import { View } from "react-native";
import LargeSolidButton from "./LargeSolidButton";

export default function LoginModal() {
  const router = useRouter();
  return (
    <View className='flex-1 gap-4 justify-center items-center p-8  '>
      <LargeSolidButton
        buttonText='Log in to continue'
        onPress={() => router.push("/login")}
      ></LargeSolidButton>
    </View>
  );
}
