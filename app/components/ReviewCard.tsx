import { Review } from "@/utils/models";
import dayjs from "dayjs";
import { Pressable, TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import themeColors from "../themeColors";
import StarRow from "./StarRow";
import UserIcon from "./UserIcon";

export type ReviewData = Review & {
  stu_first_name: string;
  stu_last_name: string;
  tut_first_name: string;
  tut_last_name: string;
  profile_icon_url: string;
};

type props = {
  review: ReviewData;
  rounded?: boolean;
  isEditing?: boolean;
  onEdit?: (review: ReviewData) => void;
  onDelete?: (review: ReviewData) => void;
  showReviweeName?: boolean;
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
  showReviweeName = false,
}: props) => {
  const createdAt = dayjs(review.created_at).format("D MMMM YYYY");
  const router = useRouter();
  const goToTutor = () => {
    router.navigate(`/viewTutor/${review.tutor_id}`);
  };

  return (
    <View className={rounded ? roundContainer : boxContainer}>
      {showReviweeName && (
        <Pressable
          className='flex-row gap-2 items-center mb-4'
          onPress={goToTutor}
        >
          <MaterialCommunityIcons
            name='arrow-right-bottom'
            size={12}
            color={themeColors["primary-700"]}
          />
          <CustomText className='text-primary-700 font-poppins-semibold text-sm'>
            For {review.tut_first_name} {review.tut_last_name}
          </CustomText>
        </Pressable>
      )}
      <View className='flex-row gap-2'>
        <UserIcon
          avatarUrl={review.profile_icon_url ? review.profile_icon_url : ""}
          size={36}
        />
        <View>
          <View className='flex-row gap-2 items-center'>
            <CustomText className='font-poppins-bold'>
              {review.stu_first_name} {review.stu_last_name[0]}.
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
              className='px-3 py-1 bg-primary-700 rounded-lg'
            >
              <CustomText className='text-neutral-100 font-poppins-semibold'>
                Edit
              </CustomText>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(review)}
              className='px-3 py-1 bg-neutral-300 rounded-lg'
            >
              <CustomText className='text-neutral-100 font-poppins-semibold'>
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
