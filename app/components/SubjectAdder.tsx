import { useContext, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { TutorProfileData } from "../(tabs)/(profile)";
import { SubjectContext } from "../contexts/subjectContext";
import CustomText from "./CustomText";
import FullPageModal from "./FullPageModal";
import LargeSolidButton from "./LargeSolidButton";

type props = {
  isShowAddSubModal: boolean;
  setIsShowAddSubModal: React.Dispatch<React.SetStateAction<boolean>>;
  tutorData: TutorProfileData;
  setTutorData: React.Dispatch<React.SetStateAction<TutorProfileData>>;
};

const levels = [
  {
    id: 1,
    name: "PSLE",
  },
  {
    id: 2,
    name: "O-level",
  },
  {
    id: 3,
    name: "A-level",
  },
];

export const levelNameToId: Record<string, number> = {
  PSLE: 1,
  "O-level": 2,
  "A-level": 3,
};

const invalidCombiSet = new Set([
  "1-1",
  "3-1",
  "5-1",
  "6-1",
  "7-1",
  "8-1",
  "10-1",
  "5-2",
  "7-2",
  "4-3",
  "11-3",
]);

const SubjectAdder = ({
  isShowAddSubModal,
  setIsShowAddSubModal,
  tutorData,
  setTutorData,
}: props) => {
  const { subjects, subjNameToIdMap } = useContext(SubjectContext);
  const [selectedSub, setSelectedSub] = useState("");
  const [selectedLevel, setSeletecLevel] = useState("");

  const onAddSubject = () => {
    if (selectedSub === "" || selectedLevel === "") return;
    let subjLevelIdCombiStr =
      subjNameToIdMap[selectedSub] + "-" + levelNameToId[selectedLevel];
    if (invalidCombiSet.has(subjLevelIdCombiStr)) {
      Toast.show({
        type: "error",
        text1: "Invalid pair",
        text2:
          "The chosen subject-level combination is invalid. Please select another pair.",
      });
      return;
    }

    if (
      tutorData.subjects.some(
        (s) => s.subject === selectedSub && s.level === selectedLevel
      )
    ) {
      setIsShowAddSubModal(false);
      return console.log("already added");
    }
    setTutorData((data) => {
      const latestId = data?.subjects[data?.subjects.length - 1]?.id ?? 0;
      const newSubject = {
        subject: selectedSub,
        level: selectedLevel,
        id: latestId + 1,
      };
      return {
        ...data,
        subjects: [...data.subjects, newSubject].sort(
          (a, b) => levelNameToId[b.level] - levelNameToId[a.level]
        ),
      };
    });

    setIsShowAddSubModal(false);
  };

  return (
    <FullPageModal
      isVisible={isShowAddSubModal}
      setIsVisible={setIsShowAddSubModal}
      title={"Add subject"}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row flex-1 items-center p-4 gap-4">
          <ScrollView
            contentContainerClassName={"flex gap-4"}
            showsVerticalScrollIndicator={false}
          >
            {subjects.map((s) => (
              <TouchableOpacity
                className={
                  "flex-row justify-between py-4 px-8 rounded-2xl " +
                  (s.name === selectedSub
                    ? "border-primary-700 border-hairline bg-primary-700"
                    : "border-neutral-300 border-hairline")
                }
                key={s.id}
                onPress={() => setSelectedSub(s.name)}
              >
                <CustomText
                  className={
                    selectedSub === s.name
                      ? "text-neutral-100"
                      : "text-neutral-900"
                  }
                >
                  {s?.name}
                </CustomText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView
            contentContainerClassName={"flex gap-4"}
            showsVerticalScrollIndicator={false}
          >
            {levels.map((level) => (
              <TouchableOpacity
                className={
                  "flex-row justify-between py-4 px-8 rounded-2xl " +
                  (level.name === selectedLevel
                    ? "border-primary-700 border-hairline bg-primary-700"
                    : "border-neutral-300 border-hairline")
                }
                key={level.id}
                onPress={() => setSeletecLevel(level.name)}
              >
                <CustomText
                  className={
                    selectedLevel === level.name
                      ? "text-neutral-100"
                      : "text-neutral-900"
                  }
                >
                  {level?.name}
                </CustomText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View className="flex justify-center items-center border-neutral-300 border-t-hairline p-4 w-full">
          <LargeSolidButton buttonText={"Add"} onPress={onAddSubject} />
        </View>
      </SafeAreaView>
    </FullPageModal>
  );
};

export default SubjectAdder;
