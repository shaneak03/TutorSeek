import { AntDesign } from "@expo/vector-icons";
import { View } from "react-native";
import themeColors from "../themeColors";

type props = {
  size: number;
  rating: number;
  position?: "left" | "right" | "center";
  onClickStar?: any;
};

export default function StarRow({
  size,
  rating,
  position = "left",
  onClickStar,
}: props) {
  return (
    <View className={"flex-row items-center gap-1 justify-" + { position }}>
      {[1, 2, 3, 4, 5].map(i => (
        <AntDesign
          key={i}
          name='star'
          size={size}
          color={
            rating >= i
              ? themeColors["primary-700"]
              : themeColors["neutral-300"]
          }
          onPress={() => onClickStar && onClickStar(i)}
        />
      ))}
    </View>
  );
}
