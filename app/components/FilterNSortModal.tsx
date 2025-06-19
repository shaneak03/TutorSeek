import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import BottomSticyButton from "./BottomStickyButton";
import CustomText from "./CustomText";
import FullPageModal from "./FullPageModal";
import { filterOptions } from "./HomeTopNav";
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
  const [editData, setEditData] = useState<filterOptions>({
    subject: 0,
    level: 0,
    rating: 1,
    minPrice: 0,
    maxPrice: 200,
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
        <SortByFilter editData={editData} setEditData={setEditData} />
      </ScrollView>
      <BottomSticyButton text={"Find tutors"} onPress={saveChanges} />
    </FullPageModal>
  );
}
