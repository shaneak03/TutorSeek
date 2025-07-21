import { getTutors } from "@/utils/getRoutes";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";
import FilterOptions, { filterOptions } from "../components/HomeTopNav";
import TutorCard, { tutorCardData } from "../components/TutorCard";
import themeColors from "../themeColors";

const Home = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [tutors, setTutors] = useState<tutorCardData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<filterOptions>({
    subject: 0,
    level: 0,
    rating: 1,
    minPrice: 0,
    maxPrice: 200,
    location: "",
    sortBy: "rating_desc",
  });

  //update location filter when user changes location setting
  useEffect(() => {
    if (!user || filters.location === "") return;
    setFilters(filters => ({ ...filters, location: user.location }));
  }, [user]);

  useEffect(() => {
    const fetchTutorData = async () => {
      setLoading(true);
      const result = await getTutors(filters);
      if (result) setTutors(result);
      setLoading(false);
    };

    fetchTutorData();
  }, [filters]);

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

  return (
    <SafeAreaView
      className='flex-1 bg-neutral-100'
      edges={['top', 'right', 'left']}
    >
      <FilterOptions
        filters={filters}
        setFilters={setFilters}
        tutors={tutors}
      />
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={themeColors["primary-700"]} />
        </View>
      ) : (
        <ScrollView
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
      )}
    </SafeAreaView>
  );
};

export default Home;
