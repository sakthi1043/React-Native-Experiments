import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

// Set notification handler to show notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function MapPage() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [targetLocation, setTargetLocation] = useState(null);
  const alertedRef = useRef(false); // prevent multiple notifications

  useEffect(() => {
    let subscriber;

    const getPermissionsAndStartLocation = async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      // Request notification permissions (important for iOS)
      const { status: notifStatus } = await Notifications.requestPermissionsAsync();
      if (notifStatus !== 'granted') {
        console.log('Notification permission denied');
      }

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
        },
        async (loc) => {
          setCurrentLocation(loc);

          if (targetLocation) {
            const distance = getDistanceFromLatLonInMeters(
              loc.coords.latitude,
              loc.coords.longitude,
              targetLocation.latitude,
              targetLocation.longitude
            );

            console.log(`Distance to target: ${distance} meters`);

            if (distance < 100 && !alertedRef.current) {
              // Send a notification instead of alert
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "Nearby Target",
                  body: "You are nearly close to the target!",
                  sound: true,
                },
                trigger: null, // trigger immediately
              });

              alertedRef.current = true; // avoid spamming notifications
            }
          }
        }
      );
    };

    getPermissionsAndStartLocation();

    return () => {
      if (subscriber) {
        subscriber.remove();
      }
    };
  }, [targetLocation]);

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setTargetLocation(coordinate);
    alertedRef.current = false; // reset alert for new target
  };

  // Haversine formula for distance in meters
  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <View style={styles.container}>
      {currentLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          region={{
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          <Marker
            coordinate={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            }}
            title="You are here"
            pinColor="blue"
          />
          {targetLocation && (
            <Marker
              coordinate={targetLocation}
              title="Target Location"
              pinColor="red"
            />
          )}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
});
