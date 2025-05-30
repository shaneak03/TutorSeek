import { UserProfile } from "@/utils/models";
import { View } from "react-native";
import CustomText from "./CustomText";
import RoundTextInput from "./RoundedTextInput";

type props = {
  profileData: UserProfile;
  setProfileData: React.Dispatch<React.SetStateAction<UserProfile>>;
  isEditing: boolean;
};

export default function CoreProfileDetails({
  profileData,

  setProfileData,

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
    </View>
  );
}
