import { Image } from "expo-image";
import { View } from "react-native";

type props = {profile_icon_url?: string}

export default function ProfileIcon({profile_icon_url, ...props}: props) {
  return (
    <View className='bg-black rounded-full border-4 border-primary-700'>
      <Image
        source={profile_icon_url ? profile_icon_url : require("../../assets/images/profile_icon.jpg")}
        style={{ width: 168, height: 168, borderRadius: 100 }}
        contentFit='cover'
      />
    </View>
  );
}
