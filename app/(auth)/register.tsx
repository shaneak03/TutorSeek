import { getUserById } from "@/utils/getRoutes";
import { createTimeTable } from "@/utils/postRoutes";
import { supabase } from "@/utils/supabase";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";
import CustomText from "../components/CustomText";
import DropDownMenu, { option } from "../components/DropDownMenu";
import EmailVerificationModal from "../components/EmailVerificationModal";
import LargeSolidButton from "../components/LargeSolidButton";
import RoundTextInput from "../components/RoundedTextInput";
import themeColors from "../themeColors";
import { userTypeOptions } from "./login";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTutor, setIsTutor] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [isSiginingUp, setIsSigningUp] = useState(false);
  const { setUser, setAuthUser } = useContext(AuthContext);
  const router = useRouter();
  const [selectedUserType, setSelectedUserType] = useState<option>(
    userTypeOptions[0]
  );

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      return setErrorMessage("Passwords do not match");
    }

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 means no rows found, which is expected if the user doesn't exist
        setErrorMessage(
          "Error checking if email is already in use. Please try again."
        );
        return console.error("Error checking email existence:", checkError);
      }

      if (existingUser) {
        setErrorMessage("This email is already registered. Please log in.");
        return;
      }

      setIsSigningUp(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "tutorseek://verify",
        },
      });

      if (error) throw new Error(error.message);

      const userData = data.user;

      if (!userData) {
        throw new Error("Failed to set session from url params");
      }

      const role = isTutor ? "tutor" : "student";

      const { error: userError } = await supabase
        .from("users")
        .insert([{ id: userData.id, role, email: userData.email }]);

      if (userError) {
        throw new Error("Error creating user profile:" + userError.message);
      }

      if (role === "tutor") {
        const { error: tutorError } = await supabase
          .from("tutors")
          .insert([{ id: userData.id }]);
        if (tutorError)
          throw new Error("Error creating tutor profile:" + tutorError);
        await createTimeTable(userData.id);
      } else {
        const { error: studentError } = await supabase
          .from("students")
          .insert([{ id: userData.id }]);
        if (studentError)
          throw new Error("Error creating student profile:" + studentError);
      }
      const user = await getUserById(userData.id);
      setUser(user);
      setAuthUser(userData);
      clearPwInputs();
      setSavedEmail(email);
      setVerificationPending(true);
      setIsSigningUp(false);
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage(
        "An error occurred during registration. Please try again."
      );
      setIsSigningUp(false);
    }
  };

  // Google OAuth Handler
  // GoogleSignin.configure({
  //   webClientId:
  //     "176743680156-f39d2bdbik845r85rdnoqpaurkri8r94.apps.googleusercontent.com",
  // });

  // const handleGoogleAuth = async () => {
  //   if (Platform.OS === "web") {
  //     setErrorMessage(
  //       "Google Sign-In is not supported on web. Please use email registration."
  //     );
  //     return;
  //   }

  //   try {
  //     await GoogleSignin.signOut();
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     if (!userInfo.data) {
  //       throw new Error("Google Sign-In failed");
  //     }
  //     if (userInfo.data.idToken) {
  //       const { data, error } = await supabase.auth.signInWithIdToken({
  //         provider: "google",
  //         token: userInfo.data.idToken,
  //       });
  //       console.log(error, data);
  //       if (error) {
  //         console.error("Supabase sign-in error:", error);
  //         setErrorMessage("Google Sign-In failed. Please try again.");
  //         return;
  //       }
  //       // Check if user already exists
  //       const existingUser = await getUserById(data.session?.user.id);
  //       if (!existingUser) {
  //         // Update Supabase User and Tutor/Student Profile
  //         const user = data.session?.user;
  //         if (!user) {
  //           throw new Error("No user data returned from Supabase");
  //         }
  //         const role = isTutor ? "tutor" : "student";
  //         const { error: userError } = await supabase.from("users").insert([
  //           {
  //             id: user.id,
  //             role,
  //             email: user.email,
  //             first_name: user.user_metadata?.full_name || "",
  //             profile_icon_url: user.user_metadata?.picture || "",
  //           },
  //         ]);
  //         if (userError) {
  //           console.error("Error inserting user profile:", userError);
  //         }
  //         if (isTutor) {
  //           const { error: tutorError } = await supabase
  //             .from("tutors")
  //             .insert([{ id: user?.id }]);
  //           if (tutorError) console.log(tutorError);
  //           await createTimeTable(user?.id);
  //         } else {
  //           const { error: studentError } = await supabase
  //             .from("students")
  //             .insert([{ id: user?.id }]);
  //           if (studentError) console.log(studentError);
  //         }
  //       }

  //       // Update Auth Context
  //       if (data.session) {
  //         const profile = await getUserById(data.session?.user.id);
  //         setUser(profile);
  //       }
  //       // Navigate to the main app
  //       router.push("/(tabs)");
  //     } else {
  //       throw new Error("no ID token present!");
  //     }
  //   } catch (error) {
  //     console.error("Google Sign-In error:", error);
  //     setErrorMessage("Google Sign-In failed. Please try again.");
  //   }
  // };

  const handleGoogleAuth = () => {};

  const onSelectUserType = async (op: option) => {
    setIsTutor(op.val === "tutor");
    setSelectedUserType(op);
  };

  const clearPwInputs = () => {
    setConfirmPassword("");
    setPassword("");
  };

  const navToLogin = () => {
    router.push("/login");
  };

  const Container = Platform.OS === "web" ? View : SafeAreaView;

  return (
    <>
      <EmailVerificationModal
        visible={verificationPending}
        onClose={() => {
          setVerificationPending(false);
          router.push("/login");
        }}
        email={savedEmail}
      />
      <Container className='flex-1 items-center gap-4 p-8 bg-neutral-100'>
        <View className='w-full flex-row items-center gap-2'>
          <CustomText className='font-poppins-bold text-2xl'>
            Register as
          </CustomText>
          <DropDownMenu
            options={userTypeOptions}
            onSelect={onSelectUserType}
            selectedOption={selectedUserType}
          />
        </View>
        <View className='w-full'>
          <CustomText className='font-poppins-semibold mb-2'>Email</CustomText>
          <RoundTextInput
            value={email}
            onChangeText={setEmail}
            placeholder='Enter your email'
          />
        </View>
        <View className='w-full'>
          <CustomText className='font-poppins-semibold mb-2'>
            Password
          </CustomText>
          <RoundTextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder='Enter your password'
          />
        </View>
        <View className='w-full'>
          <CustomText className='font-poppins-semibold mb-2'>
            Confirm password
          </CustomText>
          <RoundTextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            placeholder='Enter your password'
          />
        </View>
        {errorMessage && (
          <CustomText className='text-red-500'>{errorMessage}</CustomText>
        )}
        {isSiginingUp ? (
          <View className='bg-primary-700 rounded-[48] p-4 w-full justify-center items-center'>
            <ActivityIndicator
              size={"small"}
              color={themeColors["neutral-100"]}
            />
          </View>
        ) : (
          <LargeSolidButton
            buttonText={"Register"}
            onPress={handleRegister}
            className='mt-2'
            disabled={isSiginingUp}
          />
        )}

        <View className='w-full relative flex justify-center items-center px-4'>
          <View className='h-[1] w-full bg-neutral-900 absolute'></View>
          <CustomText className='text-sm bg-neutral-100 px-4'>
            Or Register with
          </CustomText>
        </View>
        {isSiginingUp ? (
          <View className='rounded-[48] p-4 w-full justify-center items-center border-neutral-300 border-2'>
            <ActivityIndicator
              size={"small"}
              color={themeColors["neutral-300"]}
            />
          </View>
        ) : (
          <TouchableHighlight
            onPress={handleGoogleAuth}
            className='w-full flex-row justify-center rounded-[48] border-2 border-neutral-300 p-4'
            underlayColor={themeColors["neutral-200"]}
            disabled={isSiginingUp}
          >
            <Image
              source={require("../../assets/images/google.svg")}
              style={{ width: 24, height: 24 }}
              contentFit='cover'
            />
          </TouchableHighlight>
        )}

        <CustomText className='text-sm mt-auto'>
          <Text>Already have an account? </Text>
          <Text className='text-primary-700' onPress={navToLogin}>
            Sign in
          </Text>
        </CustomText>
      </Container>
    </>
  );
};

export default Register;
