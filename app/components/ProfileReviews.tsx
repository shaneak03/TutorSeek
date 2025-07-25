import { AuthContext } from "@/app/_layout";
import { getReviewsByStudentId, getReviewsByTutorId } from "@/utils/getRoutes";
import { deleteReview, editReview } from "@/utils/postRoutes";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, View } from "react-native";
import Toast from "react-native-toast-message";
import themeColors from "../themeColors";
import CustomText from "./CustomText";
import LargeSolidButton from "./LargeSolidButton";
import RatingReviewCount from "./RatingReviewCount";
import ReviewCard, { ReviewData } from "./ReviewCard";
import ReviewList from "./ReviewList";
import RoundTextInput from "./RoundedTextInput";
import StarRow from "./StarRow";

type props = {
  role: "tutor" | "student";
  id: string;
};

const ProfileReviews = ({ role, id }: props) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editReviewData, setEditReviewData] = useState<ReviewData | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length
      : 0;

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

  // Only allow edit/delete for student's own reviews
  const handleEdit = (review: ReviewData) => {
    setEditReviewData(review);
    setEditDescription(review.description);
    setEditRating(review.rating);
    setEditModalVisible(true);
  };

  const handleDelete = (review: ReviewData) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteReview(review.id);
              setReviews(reviews.filter(r => r.id !== review.id));
            } catch {
              Toast.show({ type: "error", text1: "Failed to delete review." });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEditSubmit = async () => {
    if (!editReviewData) return;
    setLoading(true);
    try {
      console.log("handleEditSubmit: editing review", {
        id: editReviewData.id,
        editRating,
        editDescription,
      });
      await editReview(editReviewData.id, editRating, editDescription);
      setReviews(
        reviews.map(r =>
          r.id === editReviewData.id
            ? { ...r, rating: editRating, description: editDescription }
            : r
        )
      );
      setEditModalVisible(false);
    } catch (e) {
      console.error("Edit review error:", e);
      Toast.show({ type: "error", text1: "Failed to edit review." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1'>
      {role === "tutor" && (
        <RatingReviewCount
          ratingCount={avgRating}
          reviewCount={reviews.length}
        />
      )}
      <ReviewList
        reviews={reviews}
        renderItem={review => (
          <ReviewCard
            key={review.id}
            review={review}
            showReviweeName={true}
            isEditing={role === "student" && user?.id === review.student_id}
            onEdit={
              role === "student" && user?.id === review.student_id
                ? handleEdit
                : undefined
            }
            onDelete={
              role === "student" && user?.id === review.student_id
                ? handleDelete
                : undefined
            }
          />
        )}
      />

      <Modal
        visible={editModalVisible}
        animationType='fade'
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className='flex-1 justify-center items-center bg-black/40 relative'>
          {loading && (
            <ActivityIndicator
              size='large'
              color={themeColors["primary-700"]}
              className='absolute z-10'
            />
          )}
          <View className='bg-neutral-100 p-6 rounded-2xl w-11/12 max-w-md'>
            <CustomText className='text-xl font-poppins-semibold mb-2'>
              Edit Review
            </CustomText>
            <StarRow
              rating={editRating}
              size={32}
              onClickStar={setEditRating}
            />
            <RoundTextInput
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder='Edit your review...'
              multiline
              maxLength={200}
              className='mb-4 rounded-2xl mt-4 p-4'
              style={{ minHeight: 150, textAlignVertical: "top" }}
            />
            <LargeSolidButton
              buttonText='Save Changes'
              onPress={handleEditSubmit}
              className='mb-4'
            />
            <LargeSolidButton
              buttonText='Cancel'
              onPress={() => setEditModalVisible(false)}
              className='bg-gray-200'
              textClassName='text-gray-700'
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileReviews;
