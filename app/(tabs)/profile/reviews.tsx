import CustomText from "@/app/components/CustomText";
import TutorTopNav from "@/app/components/ProfileNav";
import { getUserById } from "@/utils/getRoutes";
import { UserProfile } from "@/utils/models";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../_layout";

export default function Reviews() {
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState<UserProfile>({
    id: "",
    first_name: "",
    last_name: "",
    location: "",
    role: "student",
  });

  //TODO: GET REVIEWS NOT USER DATA
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const result = await getUserById(user.id);
      if (result) {
        setUserData(result);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <SafeAreaView className='flex-1 bg-neutral-100 px-8'>
      <TutorTopNav />
      <ScrollView
        className='flex-1 '
        contentContainerClassName='flex-1 justify-center items-center'
      >
        <CustomText>Coming Soon!</CustomText>
      </ScrollView>
    </SafeAreaView>
  );
}
