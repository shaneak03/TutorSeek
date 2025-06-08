import LargeSolidButton from "@/app/components/LargeSolidButton";
import ProfileNav from "@/app/components/ProfileNav";
import TutorProfileDetails from "@/app/components/TutorProfileDetails";
import { getTutorById, getUserById } from "@/utils/getRoutes";
import { TutorProfile, UserProfile } from "@/utils/models";
import { updateTutorProfile, updateUserProfile } from "@/utils/postRoutes";
import { supabase } from "@/utils/supabase";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../_layout";
import CoreProfileDetails from "../../components/CoreProfileDetails";
import CustomText from "../../components/CustomText";
import LoginModal from "../../components/LoginModal";
import ProfileIcon, { updateProfileIcon } from "../../components/ProfileIcon";

const Profile = () => {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { user, setUser } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<UserProfile>({
    id: "",
    first_name: "",
    last_name: "",
    location: "",
    role: "student",
    email: "",
    profile_icon_url: "",
  });
  const [tutorData, setTutorData] = useState<TutorProfile>({
    id: "",
    bio: "",
    hourly_rate: 0,
    is_published: false,
  });
  // const [studentData, setStudentData] = useState<StudentProfile>({
  //   id: "",
  // });
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const fetchProfileData = useCallback(async (currentUser: any) => {
    if (!currentUser) return;

    try {
      // Fetch user data
      const userResult = await getUserById(currentUser.id);
      if (userResult) {
        setUserData(userResult);
        setAvatarUrl(userResult.profile_icon_url);

        // If user is a tutor, fetch tutor data
        if (userResult.role === "tutor") {
          const tutorResult = await getTutorById(userResult.id);
          if (tutorResult) {
            setTutorData(tutorResult);
          }
        } else if (userResult.role === "student") {
          // // Fetch student data if needed
          // const studentResult = await getStudentById(userResult.id);
          // if (studentResult) {
          //   setStudentData(studentResult);
          // }
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfileData(user);
    setRefreshing(false);
    console.log("refreshing profile");
  }, [user, fetchProfileData]);

  // Reset editing mode when screen gains focus
  useEffect(() => {
    if (isFocused) {
      setIsEditing(false);
    }
  }, [isFocused]);

  // Fetch data when user changes REMOVED: onFocus change
  useEffect(() => {
    if (user) fetchProfileData(user);
  }, [user, fetchProfileData]);

  const handleLogout = async () => {
    router.push("/login");
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);
      updateUserProfile(userData);
      if (userData.profile_icon_url !== avatarUrl) {
        updateProfileIcon(userData.id, avatarUrl);
      }
      if (userData.role === "tutor") {
        //required tutor fields to be published
        if (userData.first_name !== "" && tutorData.hourly_rate !== 0) {
          tutorData.is_published = true;
        } else {
          tutorData.is_published = false;
        }
        updateTutorProfile(tutorData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bottomPadding = isEditing ? "pb-24" : "pb-9";

  if (!user) return <LoginModal />;
  else
    return (
      <SafeAreaView className='flex-1 px-8 bg-neutral-100' edges={["top"]}>
        <ProfileNav />
        <ScrollView
          className='flex-1 pt-4'
          contentContainerClassName={"items-center gap-4 " + bottomPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <CustomText className='font-poppins-bold text-xl'>
            {userData?.role === "tutor" ? "Tutor" : "Student"}
          </CustomText>
          <ProfileIcon
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            isEditing={isEditing}
          />

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
          {userData.role === "tutor" && (
            <TutorProfileDetails
              tutorData={tutorData}
              setTutorData={setTutorData}
              isEditing={isEditing}
            />
          )}

          <CustomText
            onPress={handleLogout}
            className='underline text-center text-neutral-300'
          >
            Sign out
          </CustomText>
        </ScrollView>
        {isEditing && (
          <View className='flex-row justify-center w-full absolute bottom-0 left-8 pb-4 z-10'>
            <LargeSolidButton buttonText='Save' onPress={handleSave} />
          </View>
        )}
      </SafeAreaView>
    );
};

export default Profile;
