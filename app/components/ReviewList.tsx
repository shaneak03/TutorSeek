import { ScrollView, TouchableOpacity } from "react-native";
import CustomText from "./CustomText";
import ReviewCard, { ReviewData } from "./ReviewCard";

type props = {
  reviews: ReviewData[];
  horizontal?: boolean;
  setIsShowAllReviews?: React.Dispatch<React.SetStateAction<boolean>>;
};

type ReviewListProps = props & {
  renderItem?: (review: ReviewData) => React.ReactNode;
};

const ReviewList = ({
  reviews,
  horizontal = false,
  setIsShowAllReviews,
  renderItem,
}: ReviewListProps) => {
  const seeAllReviews = () => {
    setIsShowAllReviews && setIsShowAllReviews(true);
  };
  return (
    <ScrollView
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerClassName={horizontal ? "flex-row gap-4" : ""}
    >
      {reviews.map(r =>
        renderItem ? renderItem(r) : <ReviewCard key={r.id} review={r} rounded={horizontal} />
      )}
      {horizontal && <LastCard onPress={seeAllReviews} />}
    </ScrollView>
  );
};

const LastCard = ({ onPress }: { onPress: any }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className='flex justify-center items-center
  w-[260px] h-[140px] p-4 rounded-3xl shadow-xs bg-indigo-100'
    >
      <CustomText className='font-poppins-semibold text-primary-700'>
        Show all reviews
      </CustomText>
    </TouchableOpacity>
  );
};

export default ReviewList;
