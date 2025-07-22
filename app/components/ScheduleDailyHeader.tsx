import { dayMap } from "@/utils/days";
import { TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";

type props = {
  isEditing: boolean;
  noOfListed: number;
  activeDay: number;
  canEdit: boolean;
  onPress?: () => any;
};

const ScheduleDailyHeader = ({
  isEditing,
  noOfListed,
  activeDay,
  canEdit,
  onPress = () => {},
}: props) => {
  return (
    <View className='flex-row justify-between items-center px-4 pb-4'>
      <View className='flex-row gap-2 items-center'>
        <CustomText>
          {isEditing ? "Editing" : "Showing"} slots for: {dayMap[activeDay + 1]}
        </CustomText>
        {!isEditing && (
          <View
            className='flex items-center justify-center bg-primary-700 rounded-full'
            style={{ width: 24, height: 24 }}
          >
            <CustomText className='text-neutral-100 text-sm'>
              {!isEditing && noOfListed}
            </CustomText>
          </View>
        )}
      </View>
      {canEdit && (
        <TouchableOpacity
          onPress={onPress}
          className='bg-primary-700 px-4 py-3 rounded-2xl'
          activeOpacity={0.4}
        >
          <CustomText className='text-neutral-100'>
            {isEditing ? "Save changes" : "Edit slots"}
          </CustomText>
        </TouchableOpacity>
      )}
    </View>
  );
};
export default ScheduleDailyHeader;
