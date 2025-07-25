import { dayMap } from "@/utils/days";
import { checkIsBooked } from "@/utils/getRoutes";
import { bookSlot, deleteBookingRequest } from "@/utils/postRoutes";
import { sendPushNotification } from "@/utils/pushNotification";
import timeSlotMap from "@/utils/timeSlotMap";
import { View } from "react-native";
import Toast from "react-native-toast-message";
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
      const isBooked = await checkIsBooked(request);
      console.log("Is booked:" + isBooked);
      if (isBooked) {
        Toast.show({
          type: "error",
          text1: "You already have a booking",
          text2: "Cancel it to continue",
        });
        return;
      }

      await bookSlot(request);
      await deleteBookingRequest(request);
      await refetchRequests();
      await refetchTimeSlots();
      // Send notification to student
      try {
        await sendPushNotification(
          request.student_id,
          "Booking Accepted!",
          `Your booking request for ${dayMap[request.day + 1]} ${timeSlotMap
            .get(request.timeslot_id)
            ?.slice(0, -3)} with ${request.first_name} ${
            request.last_name
          } was accepted!`,
          "booking",
          request.profile_icon_url,
          {
            tutorId: request.tutor_id,
            status: "accepted",
          }
        );
      } catch (error) {
        console.warn("Error sending push notification (accept)", error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const rejectBookingReq = async (request: bookingRequest) => {
    try {
      await deleteBookingRequest(request);
      await refetchRequests();
      // Send notification to student
      try {
        await sendPushNotification(
          request.student_id,
          "Booking Declined",
          `Your booking request for ${dayMap[request.day + 1]} ${timeSlotMap
            .get(request.timeslot_id)
            ?.slice(0, -3)} with ${request.first_name} ${
            request.last_name
          } was declined.`,
          "booking",
          request.profile_icon_url,
          {
            tutorId: request.tutor_id,
            status: "declined",
          }
        );
      } catch (error) {
        console.warn("Error sending push notification (decline)", error);
      }
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
