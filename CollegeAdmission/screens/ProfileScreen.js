// screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, StretchInX } from 'react-native-reanimated';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Animated.Text 
        entering={FadeInUp.duration(800)}
        style={styles.title}
      >
        Student Profile
      </Animated.Text>
      
      <Animated.View 
        entering={StretchInX.delay(300).duration(600)}
        style={styles.profileCard}
      >
        <Text style={styles.profileText}>Profile information will appear here</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  profileText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});