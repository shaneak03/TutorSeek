import { Review } from "@/utils/models";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { Image } from "expo-image";
import { View } from "react-native";
import themeColors from "../themeColors";
import CustomText from "./CustomText";

export type ReviewData = Review & {
  first_name: string;
  last_name: string;
  profile_icon_url: string;
};

type props = {
  review: ReviewData;
  rounded?: boolean;
};

const roundContainer =
  "w-[220] h-[180] p-4 border-hairline border-neutral-300 rounded-3xl";
const boxContainer = "w-full px-4 py-6";

const ReviewCard = ({ review, rounded = false }: props) => {
  return (
    <View className={rounded ? roundContainer : boxContainer}>
      <View className='flex-row gap-2'>
        <Image
          source={
            review.profile_icon_url
              ? review.profile_icon_url
              : require("../../assets/images/profile_icon.jpg")
          }
          style={{ width: 36, height: 36, borderRadius: 100 }}
          contentFit='cover'
        />
        <View>
          <View className='flex-row gap-1 items-center'>
            <CustomText className='font-poppins-bold'>
              {review.first_name} {review.last_name}
            </CustomText>
            <Entypo
              name='dot-single'
              size={8}
              color={themeColors["neutral-900"]}
            />
            <CustomText className='text-sm'>11 aug</CustomText>
          </View>
          <View className='flex-row justify-start items-center'>
            {[1, 2, 3, 4, 5].map(i => {
              return (
                review.rating >= i && (
                  <AntDesign
                    key={i}
                    name='star'
                    size={16}
                    color={themeColors["primary-700"]}
                  />
                )
              );
            })}
          </View>
        </View>
      </View>
      <CustomText>{review.description}</CustomText>
    </View>
  );
};

export default ReviewCard;
