import TutorTopNav from "@/app/components/TutorTopNav";
import { getUserById } from "@/utils/getRoutes";
import { UserProfile } from "@/utils/models";
import { updateUserProfile } from "@/utils/postRoutes";
import { supabase } from "@/utils/supabase";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AuthContext } from "../../_layout";
import CoreProfileDetails from "../../components/CoreProfileDetails";
import CustomText from "../../components/CustomText";
import LargeSolidButton from "../../components/LargeSolidButton";
import LoginModal from "../../components/LoginModal";
import ProfileIcon from "../../components/ProfileIcon";

const Profile = () => {
  const router = useRouter();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useContext(AuthContext);
  const [userData, setUserData] = useState<UserProfile>({
    id: "",
    first_name: "",
    last_name: "",
    location: "",
    role: "student",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const result = await getUserById(user.id);
      if (result) {
        setUserData(result);
      }
    };

    if (isFocused) {
      setIsEditing(false);
      fetchUserData();
    }
  }, [user, isFocused]);

  const handleLogout = async () => {
    router.push("/login");
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleSave = async () => {
    setIsEditing(false);
    updateUserProfile(userData);
  };

  if (!user) return <LoginModal />;
  else
    return (
      <SafeAreaView className='flex-1 bg-neutral-100 px-8 py-4'>
        {userData.role === "tutor" && <TutorTopNav />}
        <ScrollView
          className='flex-1 '
          contentContainerClassName='items-center gap-4'
        >
          <CustomText className='font-poppins-bold text-xl'>
            {userData?.role === "tutor" ? "Tutor" : "Student"}
          </CustomText>
          <ProfileIcon />

          <CustomText
            onPress={() => setIsEditing(true)}
            className='underline text-primary-700'
          >
            Edit profile
          </CustomText>

          <CoreProfileDetails
            profileData={userData}
            setProfileData={setUserData}
            isEditing={isEditing}
          />
        </ScrollView>
        {isEditing && (
          <View className='flex-row justify-center w-full absolute bottom-0 left-8 pb-4 z-10'>
            <LargeSolidButton buttonText='Save' onPress={handleSave} />
          </View>
        )}
        <CustomText
          onPress={() => handleLogout}
          className='underline text-center text-neutral-300'
        >
          Sign out
        </CustomText>
      </SafeAreaView>
    );
};

export default Profile;
