import { View } from "react-native";
import CustomText from "./CustomText";

export type filterOptions = {
  subject: number;
  level: number;
  rating: number;
  sortBy: "rating_desc" | "rating_asc" | "price_desc" | "price_asc";
};

export default function FilterOptions() {
  return (
    <View>
      <CustomText className='h-[70] flex justify-center items-center border-b-hairline border-neutral-300'>
        Filter Options
      </CustomText>
    </View>
  );
}
