import { useRouter } from "expo-router";
import { useContext } from "react";
import { View } from "react-native";
import { AuthContext } from "../_layout";
import CustomText from "../components/CustomText";
import LoginModal from "../components/LoginModal";

const Index = () => {
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);

  //get data and set it
  // const [datas, setData] = useState([]);

  if (true) return <LoginModal />;
  else
    return (
      <View>
        <CustomText>Hello</CustomText>
      </View>
    );
};

export default Index;
