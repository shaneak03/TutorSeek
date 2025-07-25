import { dayMap } from "@/utils/days";
import {
  getBookingRequests,
  getClassesByStudentId,
  getClassesByTutorId,
} from "@/utils/getRoutes";
import { unBookSlot, updateSlots } from "@/utils/postRoutes";
import { sendPushNotification } from "@/utils/pushNotification";
import timeSlotMap from "@/utils/timeSlotMap";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";
import BookingRequestList, {
  bookingRequest,
} from "../components/BookingRequestList";
import CustomText from "../components/CustomText";
import FullPageModal from "../components/FullPageModal";
import ScheduleDailyHeader from "../components/ScheduleDailyHeader";
import ScheduleDaySelector from "../components/ScheduleDaySelector";
import TimeSlotGrid, { timeSlot } from "../components/TimeSlotGrid";
import TimeSlotInfoModal from "../components/TimeSlotInfoPopup";
import themeColors from "../themeColors";

type slotToUpdate = {
  tutor_id: string;
  day: number;
  timeslot_id: number;
};

const Schedule = () => {
  const { user } = useContext(AuthContext);
  const isFocused = useIsFocused();
  const [isEditing, setIsEditing] = useState(false);
  const [bookingRequests, setBookingRequests] = useState<bookingRequest[]>([]);
  const [isShowRequestModal, setIsShowRequestModal] = useState(false);
  const [days, setDays] = useState<timeSlot[][]>([]);
  const [tempDays, setTempDays] = useState<timeSlot[][]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [displayedTimeSlot, setDisplayedTimeSlot] = useState<timeSlot | null>(
    null
  );

  useEffect(() => {
    if (!user) return;
    if (isFocused) {
      fetchBookingRequests();
      fetchTimeSlots();
      setIsEditing(false);
    }
  }, [user, isFocused]);

  const fetchBookingRequests = async () => {
    try {
      if (user?.role === "student") return;
      const res = await getBookingRequests(user?.id ?? "");
      setBookingRequests(res);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      if (!user) return;
      if (user?.role === "tutor") {
        console.log("fetching tutor time slots");
        const res = await getClassesByTutorId(user?.id);
        setDays(res);
      } else {
        console.log("fetching student time slots");
        const res = await getClassesByStudentId(user.id);
        setDays(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateTempDays = (slot: timeSlot, action: "add" | "remove") => {
    setTempDays(days => {
      let newDays = days.map(day => [...day]);
      let prevIndex = newDays[slot.day].findIndex(
        ts => ts.timeslot_id === slot.timeslot_id
      );
      let newSlot: timeSlot = {
        ...newDays[slot.day][prevIndex],
        listed: action === "add",
        status: action === "add" ? "not_booked" : "not_listed",
      };
      newDays[slot.day][prevIndex] = newSlot;
      return newDays;
    });
  };

  const onClickSlot = async (slot: timeSlot) => {
    if (isEditing) {
      if (slot.status === "not_booked") {
        updateTempDays(slot, "remove");
      } else if (slot.status === "not_listed") {
        updateTempDays(slot, "add");
      }
      //do nothing if slot is booked
    } else {
      if (slot.status === "booked") {
        setDisplayedTimeSlot(slot);
      }
    }
  };

  const onSave = async () => {
    try {
      const toList: slotToUpdate[] = [];
      const toUnList: slotToUpdate[] = [];

      for (let d = 0; d < 7; d++) {
        for (let ts = 0; ts < (timeSlotMap?.size ?? 0); ts++) {
          const oriSlot = days[d][ts];
          const curSlot = tempDays[d][ts];
          const newSlot = {
            tutor_id: curSlot.tutor_id,
            day: curSlot.day,
            timeslot_id: curSlot.timeslot_id,
          };
          if (oriSlot.listed && !curSlot.listed) {
            toUnList.push(newSlot);
          } else if (!oriSlot.listed && curSlot.listed) {
            toList.push(newSlot);
          }
        }
      }

      if (toList.length === 0 && toUnList.length === 0) return false;

      await updateSlots(toList, "list");
      await updateSlots(toUnList, "unlist");

      return true;
    } catch (error) {
      console.log(error);
    }
  };

  const onEditOrSave = async () => {
    if (isEditing) {
      const madeAnyChanges = await onSave();
      if (madeAnyChanges) await fetchTimeSlots();
      setIsEditing(false);
    } else {
      setTempDays(days.map(day => [...day])); //deep clone (2d)
      setIsEditing(true);
    }
  };

  const onCancelBooking = async (ts: timeSlot) => {
    try {
      console.log("TO DELETE:", ts.tutor_id);
      const data = await unBookSlot(ts.tutor_id, ts.day, ts.timeslot_id);
      console.log(data);
      // Send notification to student
      try {
        const dayLabel = dayMap[ts.day + 1] || `Day ${ts.day + 1}`;
        const timeslotLabel =
          timeSlotMap.get(ts.timeslot_id) || `Slot ${ts.timeslot_id}`;
        const tutorName =
          ts.first_name && ts.last_name
            ? `${ts.first_name} ${ts.last_name}`
            : "your tutor";
        await sendPushNotification(
          ts.student_id,
          "Booking Cancelled",
          `Your booking for ${dayLabel} ${timeslotLabel} with ${tutorName} was cancelled.`,
          "booking",
          ts.profile_pic,
          {
            tutorId: ts.tutor_id,
            status: "cancelled",
          }
        );
      } catch (error) {
        console.warn("Error sending push notification (cancel)", error);
      }
      await fetchTimeSlots();
      setDisplayedTimeSlot(null);
      console.log("successfully cancelled booking");
    } catch (error) {
      console.log(error);
    }
  };

  const data = isEditing ? tempDays[activeDay] : days[activeDay];
  const noOfListed = days[activeDay]?.filter(slot => slot.listed)?.length;

  if (!user) return null;

  if (days.length === 0)
    return (
      <View className='flex-1 bg-neutral-100 justify-center items-center'>
        <ActivityIndicator size='large' color={themeColors["primary-700"]} />
      </View>
    );

  return (
    <>
      <SafeAreaView className='flex-1 bg-neutral-100' edges={["left", "right"]}>
        <ScheduleDaySelector
          activeDay={activeDay}
          setActiveDay={setActiveDay}
        />
        <ScheduleDailyHeader
          isEditing={isEditing}
          noOfListed={noOfListed}
          activeDay={activeDay}
          canEdit={user.role === "tutor"}
          onPress={onEditOrSave}
        />
        <TimeSlotGrid
          timeSlotsForCurDay={data}
          isEditing={isEditing}
          onClickSlot={onClickSlot}
          disabledCondi={ts => !isEditing && ts.status === "not_booked"}
        />
      </SafeAreaView>
      {user.role === "tutor" && (
        <TouchableOpacity
          className='absolute bg-primary-700 rounded-full items-center justify-center p-4 bottom-4 right-4'
          activeOpacity={0.4}
          onPress={() => setIsShowRequestModal(true)}
        >
          <Ionicons
            name='notifications'
            size={20}
            color={themeColors["neutral-100"]}
          />
          {bookingRequests.length > 0 && (
            <View className='bg-neutral-300 absolute top-[-2px] right-[-2px] w-6 h-6 rounded-full justify-center items-center'>
              <CustomText className='text-sm'>
                {bookingRequests.length}
              </CustomText>
            </View>
          )}
        </TouchableOpacity>
      )}
      <TimeSlotInfoModal
        data={displayedTimeSlot}
        setData={setDisplayedTimeSlot}
        buttonText={"Cancel booking"}
        onClick={onCancelBooking}
      />
      <FullPageModal
        title='Booking requests'
        isVisible={isShowRequestModal}
        setIsVisible={setIsShowRequestModal}
      >
        <BookingRequestList
          requests={bookingRequests}
          refetchRequests={fetchBookingRequests}
          refetchTimeSlots={fetchTimeSlots}
        />
      </FullPageModal>
    </>
  );
};

export default Schedule;
