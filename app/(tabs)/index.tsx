import { getAllTutors } from "@/utils/getRoutes";
import { TutorProfile } from "@/utils/models";
import { useContext, useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";
import FilterOptions from "../components/FilterOptions";
import LoginModal from "../components/LoginModal";
import TutorCard from "../components/TutorCard";

const Index = () => {
  const { user } = useContext(AuthContext);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    subject: 0,
    level: 0,
    rating: 0,
    sortBy: "rating_desc",
  });

  const onRefresh = async () => {
    setRefreshing(true);
    const result = await getAllTutors();
    if (result) {
      setTutors(result);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    if (!user) return;

    const fetchTutorData = async () => {
      const result = await getAllTutors();
      console.log(result);
      if (result) {
        setTutors(result);
      }
    };

    fetchTutorData();
  }, [user]);

  if (!user) return <LoginModal />;
  else
    return (
      <SafeAreaView className=' bg-neutral-100'>
        <FilterOptions />
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
      </SafeAreaView>
    );
};

export default Index;
