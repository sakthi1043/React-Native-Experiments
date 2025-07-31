import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './Login';
// import GeoPage from './components/GeoPage';
import GeoPage from "./Geopage"
export default function App() {
  const Stack=createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRoute="Login">
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Geopage" component={GeoPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}