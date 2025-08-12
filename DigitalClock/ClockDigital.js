import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";

export default function ClockDigital() {
  const [currentTime, setCurrentTime] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [timerInput, setTimerInput] = useState("");
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setCurrentTime(`${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setTimerDuration(0);
      alert("⏰ Timer Finished");
    }

    return () => clearInterval(intervalRef.current);
  }, [isTimerRunning, timer]);

  const handleStartTimer = () => {
    const time = parseInt(timerInput);
    if (!isNaN(time) && time > 0) {
      setTimer(time);
      setTimerDuration(time);
      setIsTimerRunning(true);
      setIsModalVisible(false);
      setTimerInput("");
    } else {
      alert("Enter a valid time in seconds");
    }
  };

  const togglePauseResume = () => {
    if (timer > 0) {
      setIsTimerRunning((prev) => !prev);
    }
  };

  const progress = timerDuration > 0 ? (timer / timerDuration) * 100 : 0;
  const circleRadius = 60;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const styles = getStyles(isDarkMode);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Digital Clock</Text>
        <Switch value={isDarkMode} onValueChange={() => setIsDarkMode(!isDarkMode)} />
      </View>

      {/* Time Display */}
      <View style={styles.clockWrapper}>
        <View style={styles.clockBox}>
          <Text style={styles.clockText}>{currentTime}</Text>
        </View>
      </View>

      {/* Timer Button */}
      <TouchableOpacity style={styles.timerButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.timerButtonText}>⏱ Set Timer</Text>
      </TouchableOpacity>

      {/* Circular Timer Display */}
      {timerDuration > 0 && (
        <View style={styles.timerContainer}>
          <Svg height="150" width="150" viewBox="0 0 150 150">
            <G rotation="-90" origin="75,75">
              <Circle
                cx="75"
                cy="75"
                r={circleRadius}
                stroke={isDarkMode ? "#555" : "#ddd"}
                strokeWidth="10"
                fill="none"
              />
              <Circle
                cx="75"
                cy="75"
                r={circleRadius}
                stroke="#FF5722"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </G>
          </Svg>
          <View style={styles.timerCenter}>
            <Text style={styles.timerValue}>{timer}s</Text>
          </View>
        </View>
      )}

      {/* Pause / Resume Button */}
      {timerDuration > 0 && (
        <TouchableOpacity
          style={[
            styles.pauseButton,
            { backgroundColor: isTimerRunning ? "#FFC107" : "#4CAF50" },
          ]}
          onPress={togglePauseResume}
        >
          <Text style={styles.modalButtonText}>
            {isTimerRunning ? "Pause" : "Resume"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Timer Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
            <Text style={styles.modalTitle}>Set Timer (seconds)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={timerInput}
              onChangeText={setTimerInput}
              placeholder="Enter seconds"
              placeholderTextColor="#888"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleStartTimer}>
              <Text style={styles.modalButtonText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "#999" }]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 50,
      paddingHorizontal: 20,
      backgroundColor: isDark ? "#181818" : "#eaeaea",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 40,
    },
    headerText: {
      fontSize: 26,
      fontWeight: "700",
      color: isDark ? "#f0f0f0" : "#333",
    },
    clockWrapper: {
      alignItems: "center",
      marginBottom: 50,
    },
    clockBox: {
      backgroundColor: isDark ? "#2c2c2c" : "#fff",
      paddingVertical: 40,
      paddingHorizontal: 50,
      borderRadius: 30,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
    },
    clockText: {
      fontSize: 55,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#000",
      letterSpacing: 3,
    },
    timerButton: {
      backgroundColor: "#8e44ad",
      alignSelf: "center",
      paddingVertical: 15,
      paddingHorizontal: 45,
      borderRadius: 35,
      elevation: 6,
      marginBottom: 25,
    },
    timerButtonText: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#fff",
    },
    timerContainer: {
      alignItems: "center",
      marginTop: 25,
    },
    timerCenter: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    timerValue: {
      fontSize: 40,
      fontWeight: "bold",
      color: "#e74c3c",
    },
    pauseButton: {
      alignSelf: "center",
      marginTop: 30,
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 35,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContent: {
      width: 340,
      padding: 30,
      borderRadius: 15,
      alignItems: "center",
      elevation: 15,
    },
    modalTitle: {
      fontSize: 24,
      marginBottom: 20,
      fontWeight: "600",
      color: isDark ? "#f0f0f0" : "#333",
    },
    input: {
      width: "100%",
      borderWidth: 2,
      borderColor: "#ccc",
      padding: 14,
      marginBottom: 20,
      borderRadius: 10,
      fontSize: 20,
      backgroundColor: isDark ? "#333" : "#fff",
      color: isDark ? "#fff" : "#000",
    },
    modalButton: {
      backgroundColor: "#3498db",
      padding: 16,
      marginVertical: 8,
      borderRadius: 10,
      width: "100%",
      alignItems: "center",
    },
    modalButtonText: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "600",
    },
  });