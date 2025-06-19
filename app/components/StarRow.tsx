import { AntDesign } from "@expo/vector-icons";
import { View } from "react-native";
import themeColors from "../themeColors";

type props = {
  size: number;
  rating: number;
  position?: "left" | "right" | "center";
  onClickStar?: any;
};

//TODO: finish up modal for reviews page and fix up the dates for the tutor cards
//also the stars are slightly too big and add a final (see all revviews card at the end) WHY THE FUCK DID YOU COPY OVER THE WHOLE THING -- just need the star row not the title

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
