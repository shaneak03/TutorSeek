import { getUserById } from "@/utils/getRoutes";
import { supabase } from "@/utils/supabase";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Pressable, Text, TouchableHighlight, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";
import CustomDropdown from "../components/CustomDropdown";
import CustomText from "../components/CustomText";
import LargeSolidButton from "../components/LargeSolidButton";
import RoundTextInput from "../components/RoundedTextInput";
import themeColors from "../themeColors";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTutor, setIsTutor] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { setUser } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    if (!(await checkUserExists())) {
      setErrorMessage("No such " + (isTutor ? "tutor" : "student"));
      setEmail("");
      setPassword("");
      return;
    }

    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(error);
      setErrorMessage(error.message);
      setEmail("");
      setPassword("");
    } else {
      router.push("/(tabs)/(home)");
    }
  };

  const checkUserExists = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("role", isTutor ? "tutor" : "student")
      .maybeSingle(); // returns null if no match

    return data !== null;
  };

  const handleTutorSelect = async (value: string) => {
    if (value === "tutor") {
      setIsTutor(true);
    } else if (value === "student") {
      setIsTutor(false);
    }
  };

  const handleForgetPw = async () => {
    router.push("/forgotPassword");
  };

  // const handleGoogleAuth = async () => {};

  // Google OAuth handler
  GoogleSignin.configure({
    webClientId: '176743680156-f39d2bdbik845r85rdnoqpaurkri8r94.apps.googleusercontent.com'
  })

  const handleGoogleAuth = async () => {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (!userInfo.data) {
        throw new Error('Google Sign-In failed');
      }
      if (userInfo.data.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        })
        console.log(error, data)
        if (error) {
          console.error("Supabase sign-in error:", error);
          setErrorMessage("Google Sign-In failed. Please try again.");
          return;
        }
        // Check if the user already exists
        const existingUser = await getUserById(data.session?.user.id);
        if (!existingUser) {
          // Update Supabase User and Tutor/Student Profile
          const user = data.session?.user;
          if (!user) {
            throw new Error('No user data returned from Supabase');
          }
          const role = isTutor ? "tutor" : "student";
          const { error: userError } = await supabase
            .from("users")
            .insert([{ id: user.id, role, email: user.email, first_name: user.user_metadata?.full_name || '', profile_icon_url: user.user_metadata?.picture || '' }])
          if (userError) {
            console.error("Error inserting user profile:", userError);
          }
          if (isTutor) {
            const { error: tutorError } = await supabase
              .from("tutors")
              .insert([{ id: user?.id }]);
            if (tutorError) console.log(tutorError);
          } else {
            const { error: studentError } = await supabase
              .from("students")
              .insert([{ id: user?.id }]);
              if (studentError) console.log(studentError);
          }
        }

        // Update Auth Context
        if (data.session) {
          const profile = await getUserById(data.session?.user.id);
          setUser(profile);
        }
        // Navigate to the main app
        router.push("/(tabs)/(home)");
      } else {
        throw new Error('no ID token present!')
      }

    } catch (error) {
      console.error("Google Sign-In error:", error);
      setErrorMessage("Google Sign-In failed. Please try again.");
    }
  }

  const navToRegister = () => {
    router.push("/register");
  };

  return (
    <SafeAreaView className='flex-1 bg-neutral-100 items-center gap-4 pt-12 p-8'>
      <View className='w-full flex-row items-center gap-2'>
        <CustomText className='font-poppins-bold text-2xl'>
          <Text> Login as </Text>
        </CustomText>
        <CustomDropdown
          options={["student", "tutor"]}
          selected={isTutor ? "tutor" : "student"}
          onSelect={handleTutorSelect}
          textClassName='text-primary-700 font-poppins-bold text-2xl'
        />
      </View>
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>Email</CustomText>
        <RoundTextInput
          value={email}
          onChangeText={setEmail}
          placeholder='Enter your email'
          inputMode='email'
        />
      </View>
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>Password</CustomText>
        <RoundTextInput
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          placeholder='Enter your password'
        />
      </View>
      <Text
        onPress={handleForgetPw}
        className='w-full text-right font-poppins-semibold text-sm color-neutral-900'
      >
        Forgot password?
      </Text>
      {errorMessage ? (
        <CustomText className='text-red-500 text-sm'>{errorMessage}</CustomText>
      ) : null}
      <LargeSolidButton
        buttonText='Login'
        onPress={handleLogin}
        className='mt-2'
      />
      <View className='w-full relative flex justify-center items-center px-4'>
        <View className='h-[1] w-full bg-neutral-900 absolute'></View>
        <CustomText className='text-sm bg-neutral-100 px-4'>
          Or login with
        </CustomText>
      </View>
      <TouchableHighlight
        onPress={handleGoogleAuth}
        className='w-full flex-row justify-center rounded-[48] border-2 border-neutral-300 p-4'
        underlayColor={themeColors["neutral-200"]}
      >
        <Image
          source={require("../../assets/images/google.svg")}
          style={{ width: 24, height: 24 }}
          contentFit='cover'
        />
      </TouchableHighlight>

      <Pressable onPress={navToRegister} className='mt-auto'>
        <CustomText className='text-sm'>
          <Text>Don&apos;t have an account? </Text>
          <Text className='text-primary-700'>Register</Text>
        </CustomText>
      </Pressable>
    </SafeAreaView>
  );
};

export default Login;
