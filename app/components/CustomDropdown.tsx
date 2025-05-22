import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  TouchableOpacity,
  View
} from "react-native";
import CustomText from "./CustomText";

const CustomDropdown = ({ options, selected, onSelect, ...props }: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (value: string) => {
    onSelect(value);
    setVisible(false);
  };

  return (
    <View className="relative">
      <Pressable
        onPress={() => setVisible(!visible)}
        className="flex-row items-center justify-between px-4 py-3 bg-neutral-100 border border-neutral-300 rounded-lg"
      >
        <CustomText {...props}>{selected}</CustomText>
        <MaterialIcons name={visible ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="gray" />
      </Pressable>

      {visible && (
        <View
          className="absolute top-full left-0 right-0 bg-neutral-100 border border-neutral-300 rounded-lg mt-1 z-10"
        >
          {options.map((item: string, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelect(item)}
              className={`px-4 py-3 ${index !== options.length - 1 ? 'border-b border-neutral-300' : ''}`}
            >
              <CustomText>{item}</CustomText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default CustomDropdown;
