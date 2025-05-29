import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";
import LargeSolidButton from "../components/LargeSolidButton";
import LoginModal from "../components/LoginModal";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const router = useRouter()
  //get data and set it
  // const [datas, setData] = useState([]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  }

  if (!user) return <LoginModal />;
  else return (
    <SafeAreaView className='flex-1 justify-center items-center gap-4 px-8 bg-neutral-100'>
      <View className='flex-1 gap-4 justify-center items-center p-8  '>
        <LargeSolidButton
          buttonText='Logout'
          onPress={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
};

export default Profile;
