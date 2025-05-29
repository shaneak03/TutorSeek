import { getUserById } from "@/utils/getRoutes";
import { UserProfile } from "@/utils/models";
import { updateUserProfile } from "@/utils/postRoutes";
import { supabase } from "@/utils/supabase";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";
import CustomText from "../components/CustomText";
import LargeSolidButton from "../components/LargeSolidButton";
import LoginModal from "../components/LoginModal";
import RoundTextInput from "../components/RoundedTextInput";



const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const router = useRouter()
  //get data and set it
  const [data, setData] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const result = await getUserById(user.id);
      if (result) {
        setData(result);
        setFirstName(result.first_name); 
        setLastName(result.last_name);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  }

  const handleSave = async () => {
    if (data) {
      data.first_name = firstName;
      data.last_name = lastName;
      updateUserProfile(data);
    }
    router.push("/")
  }

  if (!user) return <LoginModal />;
  else return (
    <SafeAreaView className='flex-1 justify-center items-center gap-4 px-8 bg-neutral-100'>
      <View className='flex-1 gap-4 justify-center items-center p-8'>
        <CustomText className='font-poppins-bold text-3xl'>
          {data?.role === "tutor" ? "Tutor" : "Student"}
        </CustomText>
        <Image
          source={require("../../assets/images/profile_icon.jpg")}
          style={{ width: 200, height: 200, borderRadius: 100 }}
          contentFit='cover'
        />
      </View>
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>First Name</CustomText>
        <RoundTextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder='Enter your first name'
        />
      </View>
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>Last Name</CustomText>
        <RoundTextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder='Enter your last name'
        />
      </View>
      <LargeSolidButton
        buttonText='Save'
        onPress={handleSave}
      />
      <LargeSolidButton
        buttonText='Logout'
        onPress={handleLogout}
      />
    </SafeAreaView>
  );
};

export default Profile;
