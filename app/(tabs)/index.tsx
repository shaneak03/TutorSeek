import { getAllTutors } from "@/utils/getRoutes";
import { TutorProfile } from "@/utils/models";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";
import CustomText from "../components/CustomText";
import LoginModal from "../components/LoginModal";
import TutorCard from "../components/TutorCard";

const Index = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    const result = await getAllTutors();
    if (result) {
      setTutors(result);
    }
    setRefreshing(false);
  };
  
  useEffect(() => {
    if (!user) return

    const fetchTutorData = async () => {
      const result = await getAllTutors();
      console.log(result)
      if (result) {
        setTutors(result);
      }
    };

    fetchTutorData()
  }, [user])

  if (!user) return <LoginModal />;
  else
    return (
      <SafeAreaView className=' bg-neutral-100'>
        <View className='h-[70] flex justify-center items-center border-b-hairline border-neutral-300'>
          <CustomText>Home</CustomText>
        </View>
        <ScrollView 
          className='h-full'
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {tutors.map((tutor, index) => tutor.is_published
            ? <TutorCard key={index} tutor={tutor} />
            : null
          )}
        </ScrollView>
      </SafeAreaView>
    );
};

export default Index;
