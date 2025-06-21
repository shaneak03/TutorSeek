import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import themeColors from "../themeColors";

type props = {
  avatarUrl: string;
  size: number;
  border?: number;
};

const UserIcon = ({ avatarUrl, size, border = 0 }: props) => {
  return (
    <View
      className={`flex items-center justify-center bg-primary-700 rounded-full p-[${border}] `}
    >
      {avatarUrl ? (
        <Image
          source={avatarUrl}
          style={{ width: size, height: size, borderRadius: 100 }}
          contentFit='cover'
        />
      ) : (
        <LinearGradient
          colors={[themeColors["primary-700"], "#ffffff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      )}
    </View>
  );
};

export default UserIcon;
