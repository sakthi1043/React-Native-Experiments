import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme, useTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import Slider from '@react-native-community/slider';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Audio } from 'expo-av';

const Tab = createBottomTabNavigator();

function HomeScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const soundRef = useRef(null);
  const { colors } = useTheme();

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const searchMusic = async () => {
    if (!query.trim()) return;
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=20`);
      const data = await response.json();
      if (data.results) {
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch songs.');
    }
  };

  const playTrack = async (track) => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      const { sound, status } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setCurrentTrack(track);
      setIsPlaying(true);
      setDuration(status?.durationMillis || 1);
    } catch (error) {
      Alert.alert('Error', 'Failed to play track.');
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      setPosition(status.positionMillis);
    }
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const seekTrack = async (value) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.trackItem} onPress={() => playTrack(item)}>
      <Image source={{ uri: item.artworkUrl100 }} style={styles.trackImage} />
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: colors.text }]} numberOfLines={1}>{item.trackName}</Text>
        <Text style={[styles.trackArtist, { color: '#666' }]} numberOfLines={1}>{item.artistName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]}
        placeholder="Search music..."
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={searchMusic}
      />
      <FlatList
        data={results}
        keyExtractor={(item, index) => item.trackId?.toString() || index.toString()}
        renderItem={renderItem}
      />
      {currentTrack && (
        <View style={[styles.playerContainer, { backgroundColor: colors.card }]}>
          <Image source={{ uri: currentTrack.artworkUrl100 }} style={styles.playerImage} />
          <View style={styles.playerInfo}>
            <Text style={[styles.playerTitle, { color: colors.text }]}>{currentTrack.trackName}</Text>
            <Text style={[styles.playerArtist, { color: '#666' }]}>{currentTrack.artistName}</Text>
          </View>
          <TouchableOpacity onPress={togglePlayPause}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
      {currentTrack && (
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={seekTrack}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="#000"
        />
      )}
    </View>
  );
}

function SettingsScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: colors.text }}>Settings Screen</Text>
    </View>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'musical-notes';
            } else if (route.name === 'Settings') {
              iconName = 'settings';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    margin: 10,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  trackInfo: {
    marginLeft: 10,
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackArtist: {
    fontSize: 14,
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerArtist: {
    fontSize: 14,
  },
});