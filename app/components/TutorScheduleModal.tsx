import { dayMap } from "@/utils/days";
import { getClassesByTutorId } from "@/utils/getRoutes";
import { createBookingRequest } from "@/utils/postRoutes";
import { sendPushNotification } from "@/utils/pushNotification";
import timeSlotMap from "@/utils/timeSlotMap";
import { useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { AuthContext } from "../_layout";
import FullPageModal from "./FullPageModal";
import ScheduleDailyHeader from "./ScheduleDailyHeader";
import ScheduleDaySelector from "./ScheduleDaySelector";
import TimeSlotGrid, { timeSlot } from "./TimeSlotGrid";
import TimeSlotInfoModal from "./TimeSlotInfoPopup";
import { tutorCardData } from "./TutorCard";

type props = {
  tutor: tutorCardData;
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TutorScheduleModal({
  tutor,
  isVisible,
  setIsVisible,
}: props) {
  const { user } = useContext(AuthContext);
  const [days, setDays] = useState<timeSlot[][]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [activeTimeSlot, setActiveTimeSlot] = useState<timeSlot | null>(null);

  useEffect(() => {
    fetchTimeSlots();
  }, [tutor]);

  const onBookSlot = async (ts: timeSlot) => {
    if (!user || !activeTimeSlot) return;
    try {
      await createBookingRequest(
        tutor.tutor_id,
        user.id,
        ts?.day,
        ts?.timeslot_id
      );
      // Send push notification to tutor
      try {
        const dayLabel = dayMap[ts.day + 1] || `Day ${ts.day + 1}`;
        const timeslotLabel = timeSlotMap.get(ts.timeslot_id) || `Slot ${ts.timeslot_id}`;
        await sendPushNotification(
          tutor.tutor_id,
          "New Booking Request!",
          `${user.first_name} ${user.last_name} has requested a booking for ${dayLabel}, ${timeslotLabel}.`,
          "booking",
          user.profile_icon_url,
          {
            senderId: user.id,
            status: "pending",
          }
        );
      } catch (error) {
        console.warn("Error sending push notification", error);
      }
      setActiveTimeSlot(null);
      Toast.show({
        type: "success",
        text1: "A booking request has been sent!",
      });
    } catch (error: any) {
      if (
        String(error?.message).startsWith(
          "duplicate key value violates unique constraint"
        )
      ) {
        Toast.show({
          type: "error",
          text1: "You can only make one request!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error sending booking request",
        });
      }
      setActiveTimeSlot(null);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const res = await getClassesByTutorId(tutor.tutor_id);
      setDays(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <FullPageModal
      title='My schedule'
      isVisible={isVisible}
      setIsVisible={setIsVisible}
    >
      <ScheduleDaySelector activeDay={activeDay} setActiveDay={setActiveDay} />
      <ScheduleDailyHeader
        isEditing={false}
        noOfListed={days[activeDay]?.filter(ts => ts.listed).length}
        activeDay={activeDay}
        canEdit={false}
      />
      <TimeSlotGrid
        timeSlotsForCurDay={days[activeDay]}
        isEditing={false}
        onClickSlot={ts =>
          setActiveTimeSlot({
            ...ts,
            first_name: tutor.first_name,
            last_name: tutor.last_name,
            profile_pic: tutor.profile_icon_url,
          })
        }
        disabledCondi={ts => user?.role === "tutor"}
      />
      <TimeSlotInfoModal
        data={activeTimeSlot}
        setData={setActiveTimeSlot}
        buttonText='Book now'
        onClick={onBookSlot}
      />
    </FullPageModal>
  );
}
