import { View } from "react-native";
import HollowButton from "./HollowButton";

type props = {
  isReviews: boolean;
  setIsReviews: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ProfileNav({ isReviews, setIsReviews }: props) {
  return (
    <View className=' py-4 flex-row justify-center items-center gap-4 border-neutral-300 border-b-hairline'>
      <HollowButton
        buttonText='Account'
        inactive={isReviews}
        onPress={() => isReviews && setIsReviews(false)}
      />
      <HollowButton
        buttonText='Reviews'
        inactive={!isReviews}
        onPress={() => !isReviews && setIsReviews(true)}
      />
    </View>
  );
}
