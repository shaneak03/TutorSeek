import { AntDesign } from "@expo/vector-icons";
import { View } from "react-native";
import themeColors from "../themeColors";
import CustomText from "./CustomText";
import { filterOptions } from "./HomeTopNav";

type props = {
  editData: filterOptions;
  setEditData: React.Dispatch<React.SetStateAction<filterOptions>>;
};

export default function RatingFilter({ editData, setEditData }: props) {
  return (
    <View className='flex p-4 gap-2 items-center'>
      <CustomText className='font-poppins-semibold text-xl '>Rating</CustomText>
      <CustomText>
        {">"} {editData.rating} stars
      </CustomText>
      <View className='flex-row justify-center items-center gap-2 p-2'>
        {[1, 2, 3, 4, 5].map(i => (
          <AntDesign
            key={i}
            name='star'
            size={32}
            color={
              editData.rating >= i
                ? themeColors["primary-700"]
                : themeColors["neutral-300"]
            }
            onPress={() => setEditData({ ...editData, rating: i })}
          />
        ))}
      </View>
    </View>
  );
}
