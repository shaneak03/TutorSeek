import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { TutorProfileData } from "../(tabs)/profile";
import themeColors from "../themeColors";
import CustomText from "./CustomText";
import HourlyRateEditor from "./HourlyRateEditor";
import RoundTextInput from "./RoundedTextInput";
import SubjectAdder from "./SubjectAdder";
import TutorSubjectList from "./TutorSubjectList";
import { Subject } from "../(tabs)/profile";

type props = {
  tutorData: TutorProfileData;
  setTutorData: React.Dispatch<React.SetStateAction<TutorProfileData>>;
  isEditing: boolean;
  setSubsToAdd: React.Dispatch<React.SetStateAction<Subject[]>>;
  setSubsToDel: React.Dispatch<React.SetStateAction<number[]>>;
};

export default function TutorProfileDetails({
  tutorData,
  setTutorData,
  isEditing,
  setSubsToAdd,
  setSubsToDel,
}: props) {
  const [isShowAddSubModal, setIsShowAddSubModal] = useState(false);
  return (
    <>
      <SubjectAdder
        isShowAddSubModal={isShowAddSubModal}
        setIsShowAddSubModal={setIsShowAddSubModal}
        setSubsToAdd={setSubsToAdd}
        setTutorData={setTutorData}
      />
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>Bio</CustomText>
        <RoundTextInput
          value={tutorData.bio}
          onChangeText={text => setTutorData(data => ({ ...data, bio: text }))}
          placeholder='Enter your bio'
          isEditing={isEditing}
        />
      </View>

      <HourlyRateEditor
        tutorData={tutorData}
        setTutorData={setTutorData}
        isEditing={isEditing}
      />
      <View className='w-full'>
        <View className='flex-row justify-between items-center'>
          <CustomText className='font-poppins-semibold mb-2'>
            Subjects
          </CustomText>
          {isEditing && (
            <TouchableOpacity
              className='flex-row gap-2'
              onPress={() => setIsShowAddSubModal(true)}
            >
              <CustomText className='text-sm text-primary-700'>
                Add subjects
              </CustomText>
              <Feather
                name='plus'
                size={16}
                color={themeColors["primary-700"]}
              />
            </TouchableOpacity>
          )}
        </View>
        <TutorSubjectList
          tutorData={tutorData}
          setTutorData={setTutorData}
          isEditing={isEditing}
          setSubsToDel={setSubsToDel}
        />
      </View>
    </>
  );
}
