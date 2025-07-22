import { dayMap } from "@/utils/days";
import timeSlotMap from "@/utils/timeSlotMap";
import { AntDesign, Feather } from "@expo/vector-icons";
import dayjs from "dayjs";
import { TouchableOpacity, View } from "react-native";
import themeColors from "../themeColors";
import { bookingRequest } from "./BookingRequestList";
import CustomText from "./CustomText";
import UserIcon from "./UserIcon";

type props = {
  requestData: bookingRequest;
  acceptBookingReq: (br: bookingRequest) => any;
  rejBookingReq: (br: bookingRequest) => any;
};

export default function BookingRequestCard({
  requestData,
  acceptBookingReq,
  rejBookingReq,
}: props) {
  const getTimeElapsed = (created_at: string) => {
    return dayjs(created_at).fromNow();
  };

  return (
    <View
      key={requestData.id}
      className='flex-row justify-between items-center p-4 rounded-3xl border-hairline border-neutral-300'
    >
      <View className='flex-row gap-2'>
        <UserIcon size={32} avatarUrl={requestData.profile_icon_url} />
        <View>
          <View className='flex-row gap-2 items-center'>
            <CustomText className='font-poppins-semibold'>
              {requestData.first_name} {requestData.last_name}
            </CustomText>
            <CustomText className='text-sm text-neutral-800'>
              {getTimeElapsed(requestData.created_at)}
            </CustomText>
          </View>
          <CustomText className='text-sm '>
            {dayMap[requestData.day + 1]}{" "}
            {timeSlotMap.get(requestData.timeslot_id)?.slice(0, -3)}
          </CustomText>
        </View>
      </View>
      <View className='flex-row gap-2'>
        <TouchableOpacity
          className='bg-primary-700 p-3 rounded-full'
          onPress={() => {
            acceptBookingReq(requestData);
          }}
        >
          <Feather name='check' size={14} color={themeColors["neutral-100"]} />
        </TouchableOpacity>
        <TouchableOpacity
          className='bg-primary-700 p-3 rounded-full'
          onPress={() => {
            rejBookingReq(requestData);
          }}
        >
          <AntDesign
            name='delete'
            size={14}
            color={themeColors["neutral-100"]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
