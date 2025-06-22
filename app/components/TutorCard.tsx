import AntDesign from "@expo/vector-icons/AntDesign";
import { View } from "react-native";
import themeColors from "../themeColors";
import CustomText from "./CustomText";
import UserIcon from "./UserIcon";

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
  last_online_at?: string;
};

const TutorCard = ({ tutor }: { tutor: tutorCardData }) => {
  return (
    <View className='p-4 flex-row items-center gap-4 border-b-hairline border-neutral-300'>
      <UserIcon avatarUrl={tutor.profile_icon_url} size={96} />
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
              <CustomText className='font-poppins-semibold'>
                {tutor.rating_count ? tutor.rating_count.toFixed(2) : "0.00"}
              </CustomText>
              <AntDesign
                name='star'
                size={12}
                color={themeColors["primary-700"]}
              />
            </View>
            <CustomText>
              {tutor.review_count ? tutor.review_count : "0"}{" "}
              {tutor.review_count === 1 ? "review" : "reviews"}
            </CustomText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TutorCard;
