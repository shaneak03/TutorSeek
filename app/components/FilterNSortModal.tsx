import { useContext, useEffect, useState } from "react";
import { ScrollView, Switch, View } from "react-native";
import Toast from "react-native-toast-message";
import { AuthContext } from "../_layout";
import themeColors from "../themeColors";
import CustomText from "./CustomText";
import FullPageModal from "./FullPageModal";
import { filterOptions } from "./HomeTopNav";
import LargeSolidButton from "./LargeSolidButton";
import PriceFilter from "./PriceFilter";
import SortByFilter from "./SortbyFilter";
import RatingFilter from "./StarRow";
import SubjectLevelPicker from "./SubjLevelFilter";

type props = {
  isShowFilterModal: boolean;
  setIsShowFilterModal: React.Dispatch<React.SetStateAction<boolean>>;
  filters: filterOptions;
  setFilters: React.Dispatch<React.SetStateAction<filterOptions>>;
};

export default function FilterNSortModal({
  isShowFilterModal,
  setIsShowFilterModal,
  filters,
  setFilters,
}: props) {
  const { user } = useContext(AuthContext);
  const [editData, setEditData] = useState<filterOptions>({
    subject: 0,
    level: 0,
    rating: 1,
    minPrice: 0,
    maxPrice: 200,
    location: "",
    sortBy: "rating_desc",
  });

  useEffect(() => {
    if (isShowFilterModal) {
      setEditData(filters);
    }
  }, [filters, isShowFilterModal]);

  const saveChanges = () => {
    setFilters(editData);
    setIsShowFilterModal(false);
  };

  const onClickStar = (rating: number) => {
    setEditData({ ...editData, rating });
  };

  return (
    <FullPageModal
      isVisible={isShowFilterModal}
      setIsVisible={setIsShowFilterModal}
      title='Filter & Sort'
    >
      <ScrollView>
        <View className='flex p-4 gap-2 items-center '>
          <CustomText className='font-poppins-semibold text-xl'>
            Rating
          </CustomText>
          <CustomText>
            {">"} {editData.rating} stars
          </CustomText>
          <RatingFilter
            size={32}
            rating={editData.rating}
            onClickStar={onClickStar}
          />
        </View>
        <SubjectLevelPicker editData={editData} setEditData={setEditData} />
        <PriceFilter editData={editData} setEditData={setEditData} />
        <View className='flex p-4 gap-2 items-center '>
          <CustomText className='font-poppins-semibold text-xl'>
            Location
          </CustomText>
          <CustomText>Only show tutors near you</CustomText>
          <Switch
            trackColor={{
              false: themeColors["neutral-300"],
              true: themeColors["primary-700"],
            }}
            thumbColor={themeColors["neutral-100"]}
            onValueChange={bool => {
              console.log(user?.location ?? "");
              if ((user?.location ?? "") === "") {
                console.log("e");
                Toast.show({
                  type: "error",
                  text1: "Please set your region first!",
                });
              }
              bool
                ? setEditData(filters => ({
                    ...filters,
                    location: user?.location ?? "",
                  }))
                : setEditData(filters => ({ ...filters, location: "" }));
            }}
            value={editData.location !== ""}
          />
        </View>
        <SortByFilter editData={editData} setEditData={setEditData} />
      </ScrollView>
      <View className='flex justify-center items-center border-neutral-300 border-t-hairline p-4 w-full bg-neutral-100'>
        <LargeSolidButton buttonText={"Find tutors"} onPress={saveChanges} />
      </View>
    </FullPageModal>
  );
}
