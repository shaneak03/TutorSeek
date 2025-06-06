import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { View } from "react-native";
import themeColors from "../themeColors";
import CustomText from "./CustomText";
import { filterOptions } from "./HomeTopNav";

type props = {
  editData: filterOptions;
  setEditData: React.Dispatch<React.SetStateAction<filterOptions>>;
};

export default function PriceFilter({ editData, setEditData }: props) {
  const onValChange = (val: number[]) => {
    setEditData({ ...editData, minPrice: val[0], maxPrice: val[1] });
  };

  return (
    <View className='flex p-4 items-center'>
      <CustomText className='font-poppins-semibold text-xl'>Price</CustomText>
      <CustomText className='mt-4'>
        SGD {editData.minPrice} - SGD {editData.maxPrice}
      </CustomText>
      <MultiSlider
        min={0}
        max={200}
        values={[editData.minPrice, editData.maxPrice]}
        onValuesChange={onValChange}
        isMarkersSeparated={true}
        enabledTwo
        selectedStyle={{
          backgroundColor: themeColors["primary-700"],
        }}
        markerStyle={{
          backgroundColor: themeColors["primary-700"],
        }}
      />
    </View>
  );
}
