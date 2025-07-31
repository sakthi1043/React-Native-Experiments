import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ThankYou({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Thank you for your feedback!</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    padding:20,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});
