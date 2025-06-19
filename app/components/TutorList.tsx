import { RefreshControl, ScrollView } from "react-native";
import TutorCard, { tutorCardData } from "./TutorCard";

type props = {
  refreshing: boolean;
  onRefresh: any;
  tutors: tutorCardData[];
};

export default function TutorList({ refreshing, onRefresh, tutors }: props) {
  return (
    <ScrollView
      className='h-full'
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {tutors.map((tutor, index) =>
        tutor.is_published ? <TutorCard key={index} tutor={tutor} /> : null
      )}
    </ScrollView>
  );
}
