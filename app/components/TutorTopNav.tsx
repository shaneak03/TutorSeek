import { usePathname, useRouter } from "expo-router";
import { View } from "react-native";
import HollowButton from "./HollowButton";

export default function TutorTopNav() {
  const router = useRouter();
  const pathName = usePathname();

  const routeTo = (targetPath: string) => {
    if (pathName !== targetPath) {
      router.push(targetPath);
    }
  };

  return (
    <View className=' py-4 flex-row justify-center items-center gap-4'>
      <HollowButton 
        buttonText='Account' 
        inactive={pathName !== "/profile"}
        onPress={() => routeTo("/profile")} />
      <HollowButton
        buttonText='Reviews'
        inactive={pathName !== "/profile/reviews"}
        onPress={() => routeTo("/profile/reviews")}
      />
    </View>
  );
}
