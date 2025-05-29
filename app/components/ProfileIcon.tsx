import { Image } from "expo-image";
import { View } from "react-native";

type props = {};

export default function ProfileIcon({}: props) {
  return (
    <View className='bg-black rounded-full border-4 border-primary-700'>
      <Image
        source={require("../../assets/images/profile_icon.jpg")}
        style={{ width: 168, height: 168, borderRadius: 100 }}
        contentFit='cover'
      />
    </View>
  );
}
