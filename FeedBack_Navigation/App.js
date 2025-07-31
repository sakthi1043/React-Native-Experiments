import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FeedbackForm from './FeedbackForm';
import ThankYou from './ThankYou';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FeedbackForm">
        <Stack.Screen name="FeedbackForm" component={FeedbackForm} options={{ title: 'Event Feedback' }} />
        <Stack.Screen name="ThankYou" component={ThankYou} options={{ title: 'Thank You' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
