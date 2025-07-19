import { bookSlot, deleteBookingRequest } from "@/utils/postRoutes";
import { View } from "react-native";
import BookingRequestCard from "./BookingRequestCard";
import CustomText from "./CustomText";

export type bookingRequest = {
  id: number;
  created_at: string;
  tutor_id: string;
  day: number;
  timeslot_id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  profile_icon_url: string;
};

type props = {
  requests: bookingRequest[];
  refetchRequests: () => any;
  refetchTimeSlots: () => any;
};

export default function BookingRequestList({
  requests,
  refetchRequests,
  refetchTimeSlots,
}: props) {
  const acceptBookingReq = async (request: bookingRequest) => {
    try {
      await bookSlot(request);
      await deleteBookingRequest(request);
      await refetchRequests();
      await refetchTimeSlots();
      console.log("accepted request");
    } catch (error) {
      console.log(error);
    }
  };

  const rejectBookingReq = async (request: bookingRequest) => {
    try {
      await deleteBookingRequest(request);
      await refetchRequests();
      console.log("deleted request");
    } catch (error) {
      console.log(error);
    }
  };

  if (requests.length === 0)
    return (
      <View className='flex-1 justify-center items-center'>
        <CustomText>No requests yet</CustomText>
      </View>
    );

  return (
    <View className='gap-4 p-4'>
      {requests.map(r => (
        <BookingRequestCard
          key={r.created_at}
          requestData={r}
          acceptBookingReq={acceptBookingReq}
          rejBookingReq={rejectBookingReq}
        />
      ))}
    </View>
  );
}
