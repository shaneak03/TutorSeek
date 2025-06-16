import { getReviewPreview, getSubjectsByTutorId } from "@/utils/getRoutes";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import themeColors from "../themeColors";
import CustomText from "./CustomText";
import FullPageModal from "./FullPageModal";
import HollowButton from "./HollowButton";
import { ReviewData } from "./ReviewCard";
import ReviewList from "./ReviewList";
import TutorCard, { tutorCardData } from "./TutorCard";

type props = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  tutor: tutorCardData | undefined;
};

//TODO: make this modal into a stack page instead so reviews can be a modal
//*modals donts stack

const TutorExpandedPage = ({ isVisible, setIsVisible, tutor }: props) => {
  const [isShowAllReviews, setIsShowAllReviews] = useState(false);
  const [bioLineCount, setBioLineCount] = useState<number | undefined>(3);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [subjects, setSubjects] = useState<
    {
      subject: string;
      level: string;
      id: number;
    }[]
  >([]);

  useEffect(() => {
    const fetchReviewsAndSubjects = async () => {
      if (!tutor) return;
      const subjectsRes = await getSubjectsByTutorId(tutor.tutor_id);
      const reviewsRes = await getReviewPreview(tutor.tutor_id);
      setReviews(reviewsRes);
      setSubjects(subjectsRes);
    };

    fetchReviewsAndSubjects();
  }, [tutor]);

  const showReviewsModal = () => {
    setIsShowAllReviews(true);
  };

  if (!tutor) return;
  return (
    <FullPageModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      title='Tutor'
    >
      <SafeAreaView className='flex-1'>
        <TutorCard tutor={tutor} />
        <View className='flex p-4 gap-2 border-b-hairline border-neutral-300'>
          <CustomText className='font-poppins-bold text-xl'>
            About me
          </CustomText>
          <CustomText numberOfLines={bioLineCount}>{tutor.bio}</CustomText>
          <TouchableOpacity
            className='bg-primary-700 px-4 py-2 self-end rounded-[48]'
            onPress={() => setBioLineCount(bioLineCount === 3 ? undefined : 3)}
          >
            <CustomText className='text-neutral-100 text-sm'>
              {bioLineCount === 3 ? "Show more" : "Show less"}
            </CustomText>
          </TouchableOpacity>
        </View>

        {reviews.length > 0 && (
          <View className='flex p-4 gap-4 border-b-hairline border-neutral-300'>
            <CustomText className='font-poppins-bold text-xl'>
              What my students say
            </CustomText>
            <ReviewList reviews={reviews} horizontal={true} />
            <HollowButton
              buttonText='Show all reviews'
              onPress={showReviewsModal}
              className='p-4'
            />
          </View>
        )}

        <View className='flex p-4 gap-2 border-b-hairline border-neutral-300'>
          <CustomText className='font-poppins-bold text-xl'>
            Subjects I teach
          </CustomText>
          <View>
            {subjects.length == 0 && (
              <View>
                <CustomText>No subjects</CustomText>
              </View>
            )}
            {subjects.length !== 0 &&
              subjects.map(s => (
                <View
                  key={s.id}
                  className='flex-row justify-between items-center px-4 py-1'
                >
                  <View className='flex-row gap-2 items-center'>
                    <FontAwesome
                      name='circle'
                      size={12}
                      color={themeColors["primary-700"]}
                    />
                    <CustomText>
                      {s.level} {s.subject}
                    </CustomText>
                  </View>
                </View>
              ))}
          </View>
        </View>
      </SafeAreaView>
    </FullPageModal>
  );
};

export default TutorExpandedPage;
