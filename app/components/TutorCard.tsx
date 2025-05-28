import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";
import { View } from "react-native";
import themeColors from "../themeColors";
import CustomText from "./CustomText";

const TutorCard = () => {
  return (
    <View className='p-4 flex-row items-center gap-4 border-b-hairline border-neutral-300'>
      <Image
        source={require("../../assets/images/profile_icon.jpg")}
        style={{ width: 96, height: 96, borderRadius: 100 }}
        contentFit='cover'
      />
      <View className='flex-grow p-2'>
        <View>
          <CustomText className='font-poppins-bold text-xl'>
            James J.
          </CustomText>
          <CustomText>O-Level . A-level</CustomText>
        </View>
        <View className='flex-row justify-between items-center mt-2'>
          <View>
            <CustomText className='font-poppins-bold'>SGD 45</CustomText>
            <CustomText>60-min lesson</CustomText>
          </View>
          <View>
            <View className='flex-row items-center gap-2'>
              <CustomText className='font-poppins-bold'>5.0</CustomText>
              <AntDesign
                name='star'
                size={12}
                color={themeColors["primary-700"]}
              />
            </View>
            <CustomText>20 reviews</CustomText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TutorCard;
