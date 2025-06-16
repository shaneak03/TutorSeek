import { ScrollView } from "react-native";
import ReviewCard, { ReviewData } from "./ReviewCard";

type props = {
  reviews: ReviewData[];
  horizontal?: boolean;
};

const ReviewList = ({ reviews, horizontal = false }: props) => {
  return (
    <ScrollView
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerClassName={horizontal ? "flex-row gap-4" : ""}
    >
      {reviews.map(r => (
        <ReviewCard review={r} rounded={horizontal} />
      ))}
    </ScrollView>
  );
};

export default ReviewList;
