import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const daysArray = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function Clock() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hour = now.getHours();
      let minutes = now.getMinutes();
      let seconds = now.getSeconds();
      let am_pm = hour >= 12 ? 'PM' : 'AM';

      // Convert to 12-hour format
      if (hour > 12) hour -= 12;
      if (hour === 0) hour = 12;

      // Add leading zero
      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;

      const timeString = `${hour}:${minutes}:${seconds} ${am_pm}`;
      const dayString = daysArray[now.getDay()];

      setCurrentTime(timeString);
      setCurrentDay(dayString);
    };

    updateClock(); // Call once immediately
    const timerId = setInterval(updateClock, 1000);

    return () => clearInterval(timerId); // Cleanup on unmount
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.daysText}>{currentDay}</Text>
      <Text style={styles.timeText}>{currentTime}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 50,
    color: '#f44336',
  },
  daysText: {
    color: '#2196f3',
    fontSize: 25,
    paddingBottom: 0,
  },
});
