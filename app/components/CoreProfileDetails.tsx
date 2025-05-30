import { StudentProfile, TutorProfile, UserProfile } from "@/utils/models";
import { View } from "react-native";
import CustomText from "./CustomText";
import RoundedNumericalInput from "./RoundedNumericalInput";
import RoundTextInput from "./RoundedTextInput";

type props = {
  profileData: UserProfile;
  tutorData: TutorProfile;
  studentData: StudentProfile
  setProfileData: React.Dispatch<React.SetStateAction<UserProfile>>;
  setTutorData: React.Dispatch<React.SetStateAction<TutorProfile>>;
  setStudentData: React.Dispatch<React.SetStateAction<StudentProfile>>;
  isEditing: boolean;
};

export default function CoreProfileDetails({
  profileData,
  tutorData,
  studentData,
  setProfileData,
  setTutorData,
  setStudentData,
  isEditing,
}: props) {

  return (
    <View className='flex-1 items-center gap-4 w-full'>
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>
          First Name
        </CustomText>
        <RoundTextInput
          value={profileData?.first_name}
          onChangeText={text =>
            setProfileData(data => ({ ...data, first_name: text }))
          }
          placeholder='Enter your first name'
          isEditing={isEditing}
        />
      </View>
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>
          Last Name
        </CustomText>
        <RoundTextInput
          value={profileData.last_name}
          onChangeText={text =>
            setProfileData(data => ({ ...data, last_name: text }))
          }
          placeholder='Enter your last name'
          isEditing={isEditing}
        />
      </View>
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>Location</CustomText>
        <RoundTextInput
          value={profileData.location}
          onChangeText={text =>
            setProfileData(data => ({ ...data, location: text }))
          }
          placeholder='Enter your location'
          isEditing={isEditing}
        />
      </View>
      {profileData.role === "tutor" && (
        <>
          <View className='w-full'>
            <CustomText className='font-poppins-semibold mb-2'>Bio</CustomText>
            <RoundTextInput
              value={tutorData.bio}
              onChangeText={text =>
                setTutorData(data => ({ ...data, bio: text }))
              }
              placeholder='Enter your bio'
              isEditing={isEditing}
            />
          </View>
          <View className='w-full'>
            <CustomText className='font-poppins-semibold mb-2'>Hourly Rate</CustomText>
            <RoundedNumericalInput
              value={tutorData.hourly_rate.toString()}
              onChangeText={text => {
                  const numericValue = text === "" ? 0 : Number(text);
                  setTutorData(data => ({ ...data, hourly_rate: numericValue }))
                }
              }
              placeholder='Enter your hourly rate'
              isEditing={isEditing}
            />
          </View>
        </>
      )}
    </View>
  );
}
