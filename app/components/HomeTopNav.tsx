import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useContext, useState } from "react";
import { Pressable, View } from "react-native";
import { SubjectContext } from "../contexts/subjectContext";
import themeColors from "../themeColors";
import CustomText from "./CustomText";
import FilterNSortModal from "./FilterNSortModal";
import { sortNameMapping } from "./SortbyFilter";
import SubjectFilterModal from "./SubjectFilterModal";
import { tutorCardData } from "./TutorCard";

export type filterOptions = {
  subject: number;
  level: number;
  rating: number;
  minPrice: number;
  maxPrice: number;
  location: string;
  sortBy: "rating_desc" | "rating_asc" | "price_desc" | "price_asc";
};

type props = {
  filters: filterOptions;
  setFilters: React.Dispatch<React.SetStateAction<filterOptions>>;
  tutors: tutorCardData[];
};

export default function HomeTopNav({ filters, setFilters, tutors }: props) {
  const [isShowFilterModal, setIsShowFilterModal] = useState(false);
  const [isShowSubjPicker, setIsShowSubjPicker] = useState(false);
  const { subjects } = useContext(SubjectContext);

  const showFilterModal = () => {
    setIsShowFilterModal(true);
  };

  const showSubjectPicker = () => {
    setIsShowSubjPicker(true);
  };

  return (
    <>
      <FilterNSortModal
        isShowFilterModal={isShowFilterModal}
        setIsShowFilterModal={setIsShowFilterModal}
        filters={filters}
        setFilters={setFilters}
      />
      <SubjectFilterModal
        subjects={subjects}
        isVisible={isShowSubjPicker}
        setIsVisible={setIsShowSubjPicker}
        filters={filters}
        setFilters={setFilters}
      />
      <View className='p-4 border-neutral-300 border-b-hairline'>
        <View>
          <Pressable
            onPress={showSubjectPicker}
            className='flex-row gap-2 items-center'
          >
            <CustomText className='font-poppins-bold'>
              {filters.subject === 0
                ? "All subjects"
                : subjects[filters.subject - 1]?.name}
            </CustomText>
            <Entypo
              name='chevron-down'
              size={16}
              color={themeColors["neutral-900"]}
            />
          </Pressable>
          <CustomText className='font-poppins-bold text-2xl mt-1'>
            <CustomText className='font-poppins-bold text-2xl text-primary-700'>
              {tutors.length}{" "}
            </CustomText>
            {tutors.length === 1 ? "tutor" : "tutors"} available
          </CustomText>
        </View>

        <View className='flex-row justify-between items-center mt-4'>
          <Pressable
            className='flex-row items-center gap-2'
            onPress={showFilterModal}
          >
            <Feather
              name='filter'
              size={16}
              color={themeColors["neutral-900"]}
            />
            <CustomText className='font-poppins-semibold'>Filter</CustomText>
          </Pressable>

          <Pressable
            className='flex-row items-center gap-2'
            onPress={showFilterModal}
          >
            <MaterialIcons
              name='sort'
              size={16}
              color={themeColors["neutral-900"]}
            />
            <CustomText className='font-poppins-semibold'>
              {sortNameMapping[filters.sortBy]}
            </CustomText>
          </Pressable>
        </View>
      </View>
    </>
  );
}
