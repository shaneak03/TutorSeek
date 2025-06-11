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

export default function SubjectLevelPicker({ editData, setEditData }: props) {
  const onButtonPress = (id: string) => {
    setEditData({ ...editData, level: Number(id) });
  };

  return (
    <View className='flex p-4 gap-1 items-center '>
      <CustomText className='font-poppins-semibold text-xl'>
        Subject level
      </CustomText>
      <RadioGroup
        radioButtons={radioButtons}
        onPress={onButtonPress}
        selectedId={String(editData.level)}
        containerStyle={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 0,
          paddingBlock: 4,
        }}
      />
    </View>
  );
}

const sharedButtonValues = {
  color: themeColors["primary-700"],
  labelStyle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: themeColors["neutral-900"],
  },
  size: 20,
};

const radioButtons = [
  {
    id: "1",
    label: "PSLE",
    value: "1",
    ...sharedButtonValues,
  },
  {
    id: "2",
    label: "O-level",
    value: "2",
    ...sharedButtonValues,
  },
  {
    id: "3",
    label: "A-level",
    value: "3",
    ...sharedButtonValues,
  },
  { id: "0", label: "All", value: "0", ...sharedButtonValues },
];
