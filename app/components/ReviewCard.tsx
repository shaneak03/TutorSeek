import { Review } from "@/utils/models";
import dayjs from "dayjs";
import { TouchableOpacity, View } from "react-native";
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
  isEditing?: boolean;
  onEdit?: (review: ReviewData) => void;
  onDelete?: (review: ReviewData) => void;
};

const roundContainer =
  "w-[260px] h-[140px] p-4 rounded-3xl shadow-xs bg-indigo-50";
const boxContainer = "w-full px-4 py-6 border-b-hairline border-neutral-300";

const ReviewCard = ({
  review,
  rounded = false,
  isEditing = false,
  onEdit,
  onDelete,
}: props) => {
  const createdAt = dayjs(review.created_at).format("D MMMM YYYY");

  return (
    <View className={rounded ? roundContainer : boxContainer}>
      <View className='flex-row gap-2'>
        <UserIcon
          avatarUrl={review.profile_icon_url ? review.profile_icon_url : ""}
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
      <CustomText
        className='mt-2'
        numberOfLines={rounded ? 3 : undefined}
        ellipsizeMode='tail'
      >
        {review.description}
      </CustomText>
      {isEditing && (
        <View className='flex-row mt-2 gap-x-4'>
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(review)}
              className='px-3 py-1 bg-blue-100 rounded-lg'
            >
              <CustomText className='text-blue-700 font-poppins-semibold'>
                Edit
              </CustomText>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(review)}
              className='px-3 py-1 bg-red-100 rounded-lg'
            >
              <CustomText className='text-red-700 font-poppins-semibold'>
                Delete
              </CustomText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default ReviewCard;
