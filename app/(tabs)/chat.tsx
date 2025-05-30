import React, { useContext } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";
import CustomText from "../components/CustomText";
import LoginModal from "../components/LoginModal";

const Chat = () => {
  const { user } = useContext(AuthContext);

  //get data and set it
  // const [datas, setData] = useState([]);

  if (!user) return <LoginModal />;
  else return (
    <SafeAreaView className='flex-1 bg-neutral-100 px-8 py-4'>
      <ScrollView
        className='flex-1 '
        contentContainerClassName="flex-1 justify-center items-center"
      >
        <CustomText>Coming Soon!</CustomText>
      </ScrollView>
    </SafeAreaView>
  )
};

export default Chat;
