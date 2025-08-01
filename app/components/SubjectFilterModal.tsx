import { Subject } from "@/utils/models";
import Entypo from "@expo/vector-icons/Entypo";
import { ScrollView, TouchableOpacity } from "react-native";
import themeColors from "../themeColors";
import CustomText from "./CustomText";
import FullPageModal from "./FullPageModal";
import { filterOptions } from "./HomeTopNav";

type props = {
  subjects: Subject[];
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  filters: filterOptions;
  setFilters: React.Dispatch<React.SetStateAction<filterOptions>>;
};

const SubjectFilterModal = ({
  subjects,
  isVisible,
  setIsVisible,
  filters,
  setFilters,
}: props) => {
  const activeSubj = filters.subject;
  const defaultSub = { id: 0, name: "All subjects" };

  return (
    <FullPageModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      title='Subjects'
    >
      <ScrollView
        contentContainerClassName={"flex gap-4 p-4"}
        showsVerticalScrollIndicator={false}
      >
        {[defaultSub, ...subjects].map(s => (
          <TouchableOpacity
            className={
              "flex-row justify-between py-4 px-8 rounded-2xl " +
              (s.id === activeSubj
                ? "border-primary-700 border-hairline"
                : "border-neutral-300 border-hairline")
            }
            key={s.id}
            onPress={() => {
              setFilters({ ...filters, subject: s.id });
              setIsVisible(false);
            }}
          >
            <CustomText
              className={
                s.id === activeSubj ? "text-primary-700" : "text-neutral-900"
              }
            >
              {s?.name}
            </CustomText>
            <Entypo
              name='chevron-small-right'
              size={24}
              color={
                themeColors[s.id === activeSubj ? "primary-700" : "neutral-900"]
              }
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </FullPageModal>
  );
};

export default SubjectFilterModal;
