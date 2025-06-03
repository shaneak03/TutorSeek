import { TutorProfile } from "@/utils/models";
import { RefreshControl, ScrollView } from "react-native";
import TutorCard from "./TutorCard";

type props = {
  refreshing: boolean;
  onRefresh: any;
  tutors: TutorProfile[];
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
