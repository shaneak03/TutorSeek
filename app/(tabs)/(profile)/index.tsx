import ProfileNav from "@/app/components/ProfileNav";
import ProfileReviews from "@/app/components/ProfileReviews";
import { levelNameToId } from "@/app/components/SubjectAdder";
import TutorProfileDetails from "@/app/components/TutorProfileDetails";
import { SubjectContext } from "@/app/contexts/subjectContext";
import themeColors from "@/app/themeColors";
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
import Feather from "@expo/vector-icons/Feather";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../_layout";
import CoreProfileDetails from "../../components/CoreProfileDetails";
import CustomText from "../../components/CustomText";
import ProfileIcon, { updateProfileIcon } from "../../components/ProfileIcon";

export type Subject = { subject: string; level: string; id: number };

export type TutorProfileData = TutorProfile & {
  subjects: Subject[];
};

const Profile = () => {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { authUser, setAuthUser, user, setUser } = useContext(AuthContext);
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
  const [serverTutorSubjs, setServerTutorSubjs] = useState<Subject[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const { subjNameToIdMap } = useContext(SubjectContext);
  const [isReviews, setIsReviews] = useState(false);

  const fetchProfileData = useCallback(async (currentUser: any) => {
    if (!currentUser) return;
    try {
      // Fetch user data
      console.log("fetching profile");
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
            setServerTutorSubjs(tutorSubjects);
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
    }
  }, [isFocused]);

  // Fetch profile data
  useEffect(() => {
    if (user && isFocused) fetchProfileData(user);
  }, [user, fetchProfileData, isFocused, isReviews]);

  const handleLogout = async () => {
    if (authUser?.id) {
      await supabase
        .from("push_tokens")
        .update({ is_active: false })
        .eq("user_id", authUser.id);
      console.log("Push token marked as inactive");
    }
    await supabase.auth.signOut();
    setUser(null);
    setAuthUser(null);
    router.push("/login");
  };

  const handleSave = async () => {
    console.log("saving");
    try {
      await updateUserProfile(userData);
      setUser(userData);
      if (userData.profile_icon_url !== avatarUrl) {
        await updateProfileIcon(userData.id, avatarUrl);
      }
      if (userData?.role === "tutor") {
        //required tutor fields to be published
        if (userData.first_name !== "" && tutorData.hourly_rate !== 0) {
          tutorData.is_published = true;
        } else {
          tutorData.is_published = false;
        }
        await updateTutorProfile(tutorData);

        const serverSubjectSet = new Set();
        serverTutorSubjs.forEach(s =>
          serverSubjectSet.add(`${s.subject}#${s.level}`)
        );
        const displaySubjectSet = new Set();
        tutorData.subjects.forEach(s =>
          displaySubjectSet.add(`${s.subject}#${s.level}`)
        );

        const subjectsToAdd = tutorData.subjects
          .filter(s => !serverSubjectSet.has(`${s.subject}#${s.level}`))
          .map(s => ({
            id: s.id,
            level: levelNameToId[s.level],
            subject: subjNameToIdMap[s.subject],
          }));

        const subjectsToDelete = serverTutorSubjs
          .filter(s => !displaySubjectSet.has(`${s.subject}#${s.level}`))
          .map(s => s.id);

        await deleteTutorSubjects(subjectsToDelete, userData.id);
        await addTutorSubjects(subjectsToAdd, userData.id);
        await fetchProfileData(userData);
      }
      setIsEditing(false);
    } catch (error) {
      console.log(error);
      await fetchProfileData(userData);
      setIsEditing(false);
    }
  };

  const bottomPadding = isEditing ? "pb-28" : "pb-9";

  return (
    <SafeAreaView
      className='flex-1 bg-neutral-100 relative'
      edges={["top", "right", "left"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ProfileNav
          isReviews={isReviews}
          setIsReviews={setIsReviews}
          setIsEditing={setIsEditing}
        />
        {isEditing && !isReviews && (
          <View
            className='flex-row justify-end w-full absolute bottom-0 pb-4 z-10 px-8'
            pointerEvents='box-none'
          >
            <Pressable
              onPress={handleSave}
              className='bg-primary-700 rounded-full p-4'
            >
              <Feather
                name='check'
                size={20}
                color={themeColors["neutral-100"]}
              />
            </Pressable>
          </View>
        )}
        {isReviews ? (
          <ProfileReviews role={userData.role} id={userData.id} />
        ) : (
          <ScrollView
            className='pt-4 px-8'
            contentContainerClassName={"items-center gap-4 " + bottomPadding}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                enabled={!isEditing}
              />
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
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Profile;
