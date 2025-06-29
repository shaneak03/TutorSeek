import { getTutors } from "@/utils/getRoutes";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../_layout";
import FilterOptions, { filterOptions } from "../../components/HomeTopNav";
import LoginModal from "../../components/LoginModal";
import TutorCard, { tutorCardData } from "../../components/TutorCard";

const Index = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [tutors, setTutors] = useState<tutorCardData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<filterOptions>({
    subject: 0,
    level: 0,
    rating: 1,
    minPrice: 0,
    maxPrice: 200,
    sortBy: "rating_desc",
  });

  useEffect(() => {
    if (!user) return;

    const fetchTutorData = async () => {
      const result = await getTutors(filters);
      if (result) setTutors(result);
    };

    fetchTutorData();
  }, [user, filters]);

  const onRefresh = async () => {
    setRefreshing(true);
    console.log("refreshing tutors");
    const result = await getTutors(filters);
    if (result) setTutors(result);
    setRefreshing(false);
  };

  const onClickTutor = (tutorId: string) => {
    router.push(`/viewTutor/${tutorId}`);
  };

  if (!user) return <LoginModal />;
  else
    return (
      <SafeAreaView className=' bg-neutral-100'>
        <FilterOptions
          filters={filters}
          setFilters={setFilters}
          tutors={tutors}
        />
        <ScrollView
          className='h-full'
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {tutors.map(tutor =>
            tutor.is_published ? (
              <Pressable
                key={tutor.tutor_id}
                onPress={() => onClickTutor(tutor.tutor_id)}
              >
                <TutorCard tutor={tutor} />
              </Pressable>
            ) : null
          )}
        </ScrollView>
      </SafeAreaView>
    );
};

export default Index;
