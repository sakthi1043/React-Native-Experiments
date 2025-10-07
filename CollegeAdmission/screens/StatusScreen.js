// screens/StatusScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, SlideInLeft } from 'react-native-reanimated';

export default function StatusScreen() {
  return (
    <View style={styles.container}>
      <Animated.Text 
        entering={FadeInUp.duration(800)}
        style={styles.title}
      >
        Application Status
      </Animated.Text>
      
      <Animated.View 
        entering={SlideInLeft.delay(200).duration(600)}
        style={styles.statusCard}
      >
        <Text style={styles.statusTitle}>Application Received</Text>
        <Text style={styles.statusDescription}>
          Your application has been received and is under review.
        </Text>
        <View style={styles.statusProgress}>
          <View style={[styles.progressStep, styles.completed]}>
            <Text style={styles.stepText}>1</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={[styles.progressStep, styles.current]}>
            <Text style={styles.stepText}>2</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <Text style={styles.stepText}>3</Text>
          </View>
        </View>
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
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  statusProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completed: {
    backgroundColor: '#27ae60',
  },
  current: {
    backgroundColor: '#3498db',
  },
  stepText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 10,
  },
});