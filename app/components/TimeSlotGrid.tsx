import timeSlotMap from "@/utils/timeSlotMap";
import { ScrollView, TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";

export type timeSlot = {
  tutor_id: string;
  student_id: string;
  day: number;
  timeslot_id: number;
  booked: boolean;
  listed: boolean;
  first_name: string;
  last_name: string;
  profile_pic: string;
  status: "booked" | "not_booked" | "not_listed";
};

type props = {
  isEditing: boolean;
  timeSlotsForCurDay: timeSlot[];
  onClickSlot: (ts: timeSlot) => any;
  disabledCondi?: (ts: timeSlot) => boolean;
};

export default function TimeSlotGrid({
  isEditing,
  timeSlotsForCurDay,
  onClickSlot,
  disabledCondi,
}: props) {
  const getSlotColor = (slot: timeSlot) => {
    if (!isEditing || slot.status === "not_listed") return "";
    else if (slot.status === "booked") {
      return "bg-neutral-300";
    } else {
      return "bg-primary-700";
    }
  };

  return (
    <ScrollView className='flex-1'>
      <View className='flex-row flex-wrap gap-4 items-center p-4'>
        {timeSlotsForCurDay.map(item => {
          if (!isEditing && item.status === "not_listed") {
            return null;
          } else {
            return (
              <TouchableOpacity
                key={item.tutor_id + item.day + item.timeslot_id}
                onPress={() => onClickSlot(item)}
                className={
                  "w-[48%] p-4 border-hairline border-neutral-300 rounded-2xl h-[64] justify-center " +
                  getSlotColor(item)
                }
                disabled={
                  (isEditing && item.status === "booked") ||
                  (disabledCondi && disabledCondi(item))
                }
                activeOpacity={0.4}
              >
                <View className='items-center'>
                  <CustomText
                    className={
                      (item.listed && isEditing ? "text-neutral-100 " : "") +
                      (item.booked ? "text-sm" : "text-lg")
                    }
                  >
                    {timeSlotMap.get(item.timeslot_id)?.slice(0, -3)}
                  </CustomText>
                  {item.booked && (
                    <CustomText
                      className={
                        (isEditing ? "text-neutral-100 " : "") + "text-sm"
                      }
                    >
                      Booked
                    </CustomText>
                  )}
                </View>
              </TouchableOpacity>
            );
          }
        })}
      </View>
    </ScrollView>
  );
}
