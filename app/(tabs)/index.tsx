import { useRouter } from "expo-router";
import { useContext } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";
import CustomText from "../components/CustomText";
import LoginModal from "../components/LoginModal";
import TutorCard from "../components/TutorCard";

const Index = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  //get data and set it
  // const [datas, setData] = useState([]);

  if (!user) return <LoginModal />;
  else
    return (
      <SafeAreaView className=' bg-neutral-100'>
        <View className='h-[100] flex justify-center items-center border-b-hairline border-neutral-300'>
          <CustomText>TODO: HEADER</CustomText>
        </View>
        <ScrollView className='h-full'>
          <TutorCard />
          <TutorCard />
          <TutorCard />
          <TutorCard />
          <TutorCard />
          <TutorCard />
        </ScrollView>
      </SafeAreaView>
    );
};

export default Index;
