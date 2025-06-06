import { useEffect, useState } from "react";
import BottomSticyButton from "./BottomStickyButton";
import FullPageModal from "./FullPageModal";
import { filterOptions } from "./HomeTopNav";
import PriceFilter from "./PriceFilter";
import RatingFilter from "./RatingFIlter";
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

  return (
    <FullPageModal
      isVisible={isShowFilterModal}
      setIsVisible={setIsShowFilterModal}
      title='Filter'
    >
      <RatingFilter editData={editData} setEditData={setEditData} />
      <SubjectLevelPicker editData={editData} setEditData={setEditData} />
      <PriceFilter editData={editData} setEditData={setEditData} />
      <BottomSticyButton text={"Filter"} onPress={saveChanges} />
    </FullPageModal>
  );
}
