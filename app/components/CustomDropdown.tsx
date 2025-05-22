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
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (value: string) => {
    onSelect(value);
    setVisible(false);
  };

  return (
    <View style={{ position: "relative" }}>
      <Pressable
        onPress={() => setVisible(!visible)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "white",
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
        }}
      >
        <CustomText {...props}>{selected}</CustomText>
        <MaterialIcons name={visible ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="gray" />
      </Pressable>

      {visible && (
        <View
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
            marginTop: 4,
            zIndex: 10,
          }}
        >
          {options.map((item: string, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelect(item)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: index !== options.length - 1 ? 1 : 0,
                borderBottomColor: "#e5e7eb",
              }}
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
