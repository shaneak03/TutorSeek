import { TutorProfile } from "@/utils/models";
import { View } from "react-native";
import CustomText from "./CustomText";
import RoundedNumericalInput from "./RoundedNumericalInput";
import RoundTextInput from "./RoundedTextInput";

type props = {
  tutorData: TutorProfile;
  setTutorData: React.Dispatch<React.SetStateAction<TutorProfile>>;
  isEditing: boolean;
};

export default function TutorProfileDetails({
  tutorData,
  setTutorData,
  isEditing,
}: props) {
  return (
    <>
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>Bio</CustomText>
        <RoundTextInput
          value={tutorData.bio}
          onChangeText={text => setTutorData(data => ({ ...data, bio: text }))}
          placeholder='Enter your bio'
          isEditing={isEditing}
        />
      </View>
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>
          Hourly Rate
        </CustomText>
        <RoundedNumericalInput
          value={tutorData.hourly_rate.toString()}
          onChangeText={text => {
            const numericValue = text === "" ? 0 : Number(text);
            setTutorData(data => ({ ...data, hourly_rate: numericValue }));
          }}
          placeholder='Enter your hourly rate'
          isEditing={isEditing}
        />
      </View>
    </>
  );
}
