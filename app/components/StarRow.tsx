import { AntDesign } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
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
        <Pressable
          key={i}
          testID={`star-${i}`}
          onPress={() => onClickStar && onClickStar(i)}
        >
          <AntDesign
            name='star'
            size={size}
            color={
              rating >= i
                ? themeColors["primary-700"]
                : themeColors["neutral-300"]
            }
          />
        </Pressable>
      ))}
    </View>
  );
}
