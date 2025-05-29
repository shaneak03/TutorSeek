import { useRouter } from "expo-router";
import { View } from "react-native";
import HollowButton from "./HollowButton";

export default function TutorTopNav() {
  const router = useRouter();

  return (
    <View className=' py-4 flex-row justify-center items-center gap-4'>
      <HollowButton buttonText='Account' onPress={() => router.push("/")} />
      <HollowButton
        buttonText='Reviews'
        inactive={true}
        onPress={() => router.push("app/(tabs)/profile/reviews")}
      />
    </View>
  );
}
