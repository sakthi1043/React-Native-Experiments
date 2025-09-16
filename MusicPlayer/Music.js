import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, SafeAreaView, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const Drawer = createDrawerNavigator();

// Main App Component with Global State
export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);

  const theme = {
    bg: isDark ? '#121212' : '#ffffff',
    card: isDark ? '#1f1f1f' : '#ffffff',
    primary: '#6200ee',
    text: isDark ? '#ffffff' : '#000000',
    subText: isDark ? '#b3b3b3' : '#666666',
    border: isDark ? '#333333' : '#e0e0e0'
  };

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    fetchMusic();
    return () => sound?.unloadAsync();
  }, []);

  const fetchMusic = async (query = 'pop music') => {
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=20`);
      const data = await response.json();
      const processedTracks = data.results.filter(t => t.previewUrl).map(t => ({
        id: t.trackId,
        title: t.trackName,
        artist: t.artistName,
        artwork: t.artworkUrl100,
        previewUrl: t.previewUrl
      }));
      setTracks(processedTracks);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch music');
    }
  };

  const playTrack = async (track) => {
    try {
      if (sound) await sound.unloadAsync();
      if (currentTrack?.id === track.id) {
        setIsPlaying(!isPlaying);
        return;
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: track.previewUrl });
      setSound(newSound);
      setCurrentTrack(track);
      setIsPlaying(true);
      await newSound.playAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to play track');
    }
  };

  const togglePlayPause = async () => {
    if (sound) {
      isPlaying ? await sound.pauseAsync() : await sound.playAsync();
      setIsPlaying(!isPlaying);
    }
  };

  // Music Item Component
  const MusicItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.item, { 
        backgroundColor: currentTrack?.id === item.id ? theme.primary + '20' : theme.card,
        borderBottomColor: theme.border 
      }]} 
      onPress={() => playTrack(item)}
    >
      <Image source={{ uri: item.artwork }} style={styles.artwork} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.artist, { color: theme.subText }]} numberOfLines={1}>{item.artist}</Text>
      </View>
      <Ionicons 
        name={currentTrack?.id === item.id && isPlaying ? "pause" : "play"} 
        size={24} 
        color={theme.primary} 
      />
    </TouchableOpacity>
  );

  // Player Component
  const Player = () => currentTrack ? (
    <View style={[styles.player, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
      <Image source={{ uri: currentTrack.artwork }} style={styles.playerArt} />
      <View style={styles.playerInfo}>
        <Text style={[styles.playerTitle, { color: theme.text }]} numberOfLines={1}>{currentTrack.title}</Text>
        <Text style={[styles.playerArtist, { color: theme.subText }]} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>
      <TouchableOpacity onPress={togglePlayPause} style={[styles.playBtn, { backgroundColor: theme.primary }]}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
      </TouchableOpacity>
    </View>
  ) : null;

  // Home Screen
  const HomeScreen = ({ navigation }) => (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Music Player</Text>
        <TouchableOpacity onPress={() => setIsDark(!isDark)}>
          <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder="Search music..."
          placeholderTextColor={theme.subText}
          onSubmitEditing={(e) => fetchMusic(e.nativeEvent.text)}
        />
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MusicItem item={item} />}
        contentContainerStyle={styles.list}
      />
      <Player />
    </SafeAreaView>
  );

  // Settings Screen
  const SettingsScreen = ({ navigation }) => (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <TouchableOpacity 
        style={[styles.settingItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
        onPress={() => setIsDark(!isDark)}
      >
        <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={theme.primary} />
        <Text style={[styles.settingText, { color: theme.text }]}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // Custom Drawer
  const CustomDrawer = ({ navigation }) => (
    <SafeAreaView style={[styles.drawer, { backgroundColor: theme.bg }]}>
      <View style={[styles.drawerHeader, { backgroundColor: theme.primary }]}>
        <Ionicons name="musical-notes" size={40} color="white" />
        <Text style={styles.drawerTitle}>Music Player</Text>
      </View>
      
      {[
        { name: 'Home', icon: 'home', screen: 'Home' },
        { name: 'Settings', icon: 'settings', screen: 'Settings' }
      ].map(item => (
        <TouchableOpacity
          key={item.name}
          style={[styles.drawerItem, { borderBottomColor: theme.border }]}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Ionicons name={item.icon} size={24} color={theme.text} />
          <Text style={[styles.drawerItemText, { color: theme.text }]}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );

  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  searchContainer: { padding: 16, paddingTop: 0 },
  searchInput: { height: 40, borderRadius: 20, paddingHorizontal: 16, borderWidth: 1 },
  list: { paddingBottom: 100 },
  item: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, alignItems: 'center' },
  artwork: { width: 50, height: 50, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  artist: { fontSize: 14, marginTop: 2 },
  player: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1 },
  playerArt: { width: 40, height: 40, borderRadius: 8 },
  playerInfo: { flex: 1, marginLeft: 12 },
  playerTitle: { fontSize: 14, fontWeight: 'bold' },
  playerArtist: { fontSize: 12, marginTop: 2 },
  playBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  settingText: { fontSize: 16, marginLeft: 12 },
  drawer: { flex: 1 },
  drawerHeader: { padding: 20, alignItems: 'center', paddingTop: 50 },
  drawerTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, color: 'white' },
  drawerItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  drawerItemText: { fontSize: 16, marginLeft: 16 }
});