import React from 'react';
import { View, Text, StyleSheet,Image } from 'react-native';

export default function ThankYouScreen({ route }) {
  const { feedback } = route.params || {};

  return (
    <View style={styles.container}>
      <Image
          source={require('./assets/free.webp')}
          style={styles.logo}
        />
      <Text style={styles.heading}>Thank You for your feedback!</Text>
      {feedback && (
        <View style={styles.summary}>
          <Text>Name: {feedback.name}</Text>
          <Text>Email: {feedback.email}</Text>
          <Text>Course: {feedback.course}</Text>
          <Text>Rating: {feedback.rating}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  summary: { marginTop: 10, alignItems: 'center' },
  logo:{
    width:200,
    height:200,
    resizeMode:'contain',
    alignSelf:'center',
    marginBottom:20,
  }
});