import { Review } from "@/utils/models";
import dayjs from "dayjs";
import { View } from "react-native";
import CustomText from "./CustomText";

import StarRow from "./StarRow";
import UserIcon from "./UserIcon";

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
  "w-[280px] h-[160px] p-4 rounded-3xl shadow-xs bg-indigo-50";
const boxContainer = "w-full px-4 py-6 border-b-hairline border-neutral-300";

const ReviewCard = ({ review, rounded = false }: props) => {
  const createdAt = dayjs(review.created_at).format("D MMMM YYYY");

  return (
    <View className={rounded ? roundContainer : boxContainer}>
      <View className='flex-row gap-2'>
        <UserIcon
          avatarUrl={
            review.profile_icon_url
              ? review.profile_icon_url
              : ""
          }
          size={36}
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
      <CustomText numberOfLines={4} ellipsizeMode='tail'>
        {review.description}
      </CustomText>
    </View>
  );
};

export default ReviewCard;
