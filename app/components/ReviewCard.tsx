import { Review } from "@/utils/models";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { View } from "react-native";
import CustomText from "./CustomText";

import StarRow from "./StarRow";

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
  "w-[280] h-[160] p-4 border-hairline border-neutral-300 rounded-3xl";
const boxContainer = "w-full px-4 py-6 border-b-hairline border-neutral-300";

const ReviewCard = ({ review, rounded = false }: props) => {
  const createdAt = dayjs(review.created_at).format("D MMMM YYYY");

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
          <View className='flex-row gap-2 items-center'>
            <CustomText className='font-poppins-bold'>
              {review.first_name} {review.last_name[0]}.
            </CustomText>

            <CustomText className='text-sm'>{createdAt}</CustomText>
          </View>
          <StarRow rating={review.rating} size={14} />
        </View>
      </View>
      <CustomText>{review.description}</CustomText>
    </View>
  );
};

export default ReviewCard;
