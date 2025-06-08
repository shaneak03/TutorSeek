import React from "react";
import { View } from "react-native";
import RadioGroup from "react-native-radio-buttons-group";
import themeColors from "../themeColors";
import CustomText from "./CustomText";
import { filterOptions } from "./HomeTopNav";

type props = {
  editData: filterOptions;
  setEditData: React.Dispatch<React.SetStateAction<filterOptions>>;
};

export const sortNameMapping = {
  price_asc: "Price: lowest first",
  price_desc: "Price: highest first",
  rating_asc: "Rating: lowest first",
  rating_desc: "Rating: highest first",
};

const sharedButtonValues = {
  color: themeColors["primary-700"],
  labelStyle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: themeColors["neutral-900"],
  },
  size: 20,
};

const radioButtons = Object.entries(sortNameMapping).map(entry => ({
  id: entry[0],
  label: entry[1],
  value: entry[0],
  ...sharedButtonValues,
}));

export default function SortByFilter({ editData, setEditData }: props) {
  const onButtonPress = (val: string) => {
    setEditData({ ...editData, sortBy: val as typeof editData.sortBy });
  };

  return (
    <View className='flex p-4 gap-1 items-center'>
      <CustomText className='font-poppins-semibold text-xl'>Sort by</CustomText>
      <RadioGroup
        radioButtons={radioButtons}
        onPress={onButtonPress}
        selectedId={editData.sortBy}
        containerStyle={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 0,
          paddingBlock: 4,
        }}
      />
    </View>
  );
}
