import CustomText from "@/app/components/CustomText";
import FullPageModal from "@/app/components/FullPageModal";
import LargeSolidButton from "@/app/components/LargeSolidButton";
import RatingReviewCount from "@/app/components/RatingReviewCount";
import { ReviewData } from "@/app/components/ReviewCard";
import ReviewList from "@/app/components/ReviewList";
import TutorCard, { tutorCardData } from "@/app/components/TutorCard";
import {
  getReviewsByTutorId,
  getSubjectsByTutorId,
  getTutor,
} from "@/utils/getRoutes";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import themeColors from "../../../themeColors";

const viewTutor = () => {
  const params = useLocalSearchParams();
  const tutorId = params?.id as string;
  const [tutor, setTutor] = useState<tutorCardData>();
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
    const fetchDetails = async () => {
      try {
        const tutorRes: tutorCardData = await getTutor(tutorId);
        const subjectsRes = await getSubjectsByTutorId(tutorRes.tutor_id);
        const reviewsRes = await getReviewsByTutorId(tutorRes.tutor_id);
        setTutor(tutorRes);
        setReviews(reviewsRes);
        setSubjects(subjectsRes);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDetails();
  }, [tutorId]);

  const showReviewsModal = () => {
    setIsShowAllReviews(true);
  };

  const onContactTutor = () => {
    //TODO: THANKS SHANE
  };

  if (!tutor) return;
  return (
    <>
      <FullPageModal
        title='Reviews'
        isVisible={isShowAllReviews}
        setIsVisible={setIsShowAllReviews}
      >
        <RatingReviewCount
          ratingCount={tutor.rating_count}
          reviewCount={tutor.review_count}
        />
        <ReviewList reviews={reviews} />
      </FullPageModal>
      <SafeAreaView className='flex-1 bg-neutral-100'>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TutorCard tutor={tutor} />
          <View className='flex p-4 gap-2 border-b-hairline border-neutral-300'>
            <CustomText className='font-poppins-bold text-xl'>
              About me
            </CustomText>
            <CustomText numberOfLines={bioLineCount}>{tutor.bio}</CustomText>
            <TouchableOpacity
              className='bg-primary-700 px-4 py-2 self-end rounded-[48]'
              onPress={() =>
                setBioLineCount(bioLineCount === 3 ? undefined : 3)
              }
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
              <ReviewList
                reviews={reviews.slice(0, 3)}
                horizontal={true}
                setIsShowAllReviews={setIsShowAllReviews}
              />
            </View>
          )}

          <View className='flex p-4 gap-2'>
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
        </ScrollView>
        <View className='p-4 border-t-hairline border-neutral-300'>
          <LargeSolidButton buttonText='Contact me' onPress={onContactTutor} />
        </View>
      </SafeAreaView>
    </>
  );
};

export default viewTutor;
