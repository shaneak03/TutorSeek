import { getAvgRatingAndReviewCount } from "@/utils/getRoutes";
import { postReview, updateRatingReview } from "@/utils/postRoutes";
import { sendPushNotification } from "@/utils/pushNotification";
import { useContext, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { AuthContext } from "../_layout";
import CustomText from "./CustomText";
import FullPageModal from "./FullPageModal";
import LargeSolidButton from "./LargeSolidButton";
import RoundTextInput from "./RoundedTextInput";
import StarRow from "./StarRow";

type props = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  tutorId: string;
};

const PostReviewModal = ({ isVisible, setIsVisible, tutorId }: props) => {
  const [desc, setDesc] = useState("");
  const [rating, setRating] = useState(4);
  const { user } = useContext(AuthContext);

  const publishReview = async () => {
    try {
      await postReview(user?.id ?? "", tutorId, rating, desc);
      await sendPushNotification(
        tutorId,
        "New review posted!",
        `${user?.first_name} ${user?.last_name} has posted a new review on your profile`,
        "review",
        user?.profile_icon_url,
        {
          tutorId: tutorId,
          senderId: user?.id ?? "",
          review: desc,
          rating: rating,
        }
      );
      const res = await getAvgRatingAndReviewCount(tutorId);
      console.log(res);
      if (res)
        await updateRatingReview(
          res?.average_rating,
          res?.review_count,
          tutorId
        );
      setIsVisible(false);
    } catch (error: any) {
      if (error?.code === "23505") {
        Toast.show({
          type: "error",
          text1: "Duplicate Review",
          text2: "You have already posted a review for this tutor.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to post review. Please try again.",
        });
      }
    }
  };

  const onClickStar = (rating: number) => {
    setRating(rating);
  };

  const onChangeText = (val: string) => {
    setDesc(val);
  };

  return (
    <FullPageModal title=' ' isVisible={isVisible} setIsVisible={setIsVisible}>
      <View className='flex-1 justify-center items-center p-8'>
        <View className='mb-8'>
          <CustomText className='font-poppins-semibold text-xl mb-4 text-center'>
            Leave a review
          </CustomText>
          <StarRow rating={rating} size={36} onClickStar={onClickStar} />
        </View>
        <RoundTextInput
          value={desc}
          maxLength={200}
          onChangeText={onChangeText}
          borderRadius={24}
          multiline={true}
          placeholder='Your review'
          style={{ minHeight: 150, textAlignVertical: "top" }}
          className='mb-2'
        />
        <CustomText
          className={
            "mb-8 self-end text-sm " +
            (desc.length === 200 ? "text-primary-700" : "")
          }
        >
          {desc.length}/200
        </CustomText>
        <LargeSolidButton buttonText='Publish review' onPress={publishReview} />
      </View>
    </FullPageModal>
  );
};

export default PostReviewModal;
