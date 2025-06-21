import LargeSolidButton from "@/app/components/LargeSolidButton";
import ProfileNav from "@/app/components/ProfileNav";
import ProfileReviews from "@/app/components/ProfileReviews";
import { levelNameToId } from "@/app/components/SubjectAdder";
import TutorProfileDetails from "@/app/components/TutorProfileDetails";
import { SubjectContext } from "@/app/contexts/subjectContext";
import {
  getSubjectsByTutorId,
  getTutorById,
  getUserById,
} from "@/utils/getRoutes";
import { TutorProfile, UserProfile } from "@/utils/models";
import {
  addTutorSubjects,
  deleteTutorSubjects,
  updateTutorProfile,
  updateUserProfile,
} from "@/utils/postRoutes";
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

export type Subject = { subject: string; level: string; id: number };

export type TutorProfileData = TutorProfile & {
  subjects: Subject[];
};

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
  const [tutorData, setTutorData] = useState<TutorProfileData>({
    id: "",
    bio: "",
    hourly_rate: 0,
    is_published: false,
    subjects: [],
  });
  const [subsToDel, setSubsToDel] = useState<number[]>([]);
  const [subsToAdd, setSubsToAdd] = useState<Subject[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const { subjNameToIdMap } = useContext(SubjectContext);
  const [isReviews, setIsReviews] = useState(false);

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
            const tutorSubjects = await getSubjectsByTutorId(userResult.id);
            setTutorData(data => ({
              ...data,
              ...tutorResult,
              subjects: tutorSubjects,
            }));
          }
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
      setSubsToAdd([]);
      setSubsToDel([]);
    }
  }, [isFocused]);

  // Fetch profile data
  useEffect(() => {
    if (user && isFocused) fetchProfileData(user);
  }, [user, fetchProfileData, isFocused, isReviews]);

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
        const mappedSubsToAdd = subsToAdd.map(s => ({
          id: s.id,
          level: levelNameToId[s.level],
          subject: subjNameToIdMap[s.subject],
        }));

        addTutorSubjects(mappedSubsToAdd, userData.id);
        deleteTutorSubjects(subsToDel, userData.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bottomPadding = isEditing ? "pb-28" : "pb-9";

  if (!user) return <LoginModal />;
  else
    return (
      <SafeAreaView className='flex-1 bg-neutral-100' edges={["top"]}>
        <ProfileNav
          isReviews={isReviews}
          setIsReviews={setIsReviews}
          setIsEditing={setIsEditing}
        />

        {isReviews ? (
          <ProfileReviews role={userData.role} id={userData.id} />
        ) : (
          <ScrollView
            className='flex-1 pt-4 px-8'
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
                setSubsToAdd={setSubsToAdd}
                setSubsToDel={setSubsToDel}
              />
            )}

            <CustomText
              onPress={handleLogout}
              className='underline text-center text-neutral-300'
            >
              Sign out
            </CustomText>
          </ScrollView>
        )}
        {isEditing && (
          <View className='flex-row justify-center w-full absolute bottom-0 pb-4 z-10 px-8'>
            <LargeSolidButton buttonText='Save' onPress={handleSave} />
          </View>
        )}
      </SafeAreaView>
    );
};

export default Profile;
