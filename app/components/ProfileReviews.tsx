import { getReviewsByStudentId, getReviewsByTutorId } from "@/utils/getRoutes";
import { useEffect, useState } from "react";
import { View } from "react-native";
import RatingReviewCount from "./RatingReviewCount";
import { ReviewData } from "./ReviewCard";
import ReviewList from "./ReviewList";

type props = {
  role: "tutor" | "student";
  id: string;
};

const ProfileReviews = ({ role, id }: props) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const reviewData =
        role === "tutor"
          ? await getReviewsByTutorId(id)
          : await getReviewsByStudentId(id);
      setReviews(reviewData);
    };

    fetchReviews();
  }, [role, id]);

  return (
    <View>
      {role === "tutor" && (
        <RatingReviewCount ratingCount={2} reviewCount={2} />
      )}
      <ReviewList reviews={reviews} />
    </View>
  );
};

export default ProfileReviews;
