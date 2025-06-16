import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";
import { View } from "react-native";
import themeColors from "../themeColors";
import CustomText from "./CustomText";

export type tutorCardData = {
  tutor_id: string;
  first_name: string;
  last_name: string;
  hourly_rate: number;
  profile_icon_url: string;
  bio: string;
  rating_count: number;
  review_count: number;
  is_published: boolean;
};

const TutorCard = ({ tutor }: { tutor: tutorCardData }) => {
  return (
    <View className='p-4 flex-row items-center gap-4 border-b-hairline border-neutral-300'>
      <Image
        source={
          tutor.profile_icon_url
            ? tutor.profile_icon_url
            : require("../../assets/images/profile_icon.jpg")
        }
        style={{ width: 96, height: 96, borderRadius: 100 }}
        contentFit='cover'
      />
      <View className='flex-grow p-2'>
        <View>
          <CustomText className='font-poppins-bold text-xl'>
            {tutor.first_name + " " + tutor.last_name}
          </CustomText>
        </View>
        <View className='flex-row justify-between items-center mt-2'>
          <View>
            <CustomText className='font-poppins-semibold'>
              SGD {tutor.hourly_rate}
            </CustomText>
            <CustomText>60-min lesson</CustomText>
          </View>
          <View>
            <View className='flex-row items-center gap-2'>
              <CustomText className='font-poppins-semibold'>5.0</CustomText>
              <AntDesign
                name='star'
                size={12}
                color={themeColors["primary-700"]}
              />
            </View>
            <CustomText>20 reviews</CustomText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TutorCard;
