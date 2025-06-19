import { View } from "react-native";
import CustomText from "./CustomText";

type props = {
  ratingCount: number;
  reviewCount: number;
};

const RatingReviewCount = ({ ratingCount, reviewCount }: props) => {
  return (
    <View className='flex-row border-b-hairline border-neutral-300 p-4 items-center'>
      <CustomText className='font-poppins-bold text-2xl text-primary-700'>
        4.00{" "}
      </CustomText>
      <CustomText className='font-poppins text-sm pt-[5]'>out of</CustomText>
      <CustomText className='font-poppins-semibold text-2xl mr-2 '>
        {" "}
        5.00
      </CustomText>
      <CustomText>(2 reviews)</CustomText>
    </View>
  );
};

export default RatingReviewCount;
