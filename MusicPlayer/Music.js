import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  TextInput,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

// Theme Context
const ThemeContext = createContext();

const lightTheme = {
  background: '#f8f9fa',
  surface: '#ffffff',
  primary: '#6c5ce7',
  primaryVariant: '#a29bfe',
  secondary: '#fd79a8',
  onBackground: '#2d3436',
  onSurface: '#2d3436',
  onPrimary: '#ffffff',
  card: '#ffffff',
  border: '#dfe6e9',
  text: '#2d3436',
  subText: '#636e72',
  accent: '#00cec9'
};

const darkTheme = {
  background: '#121212',
  surface: '#1e1e1e',
  primary: '#a29bfe',
  primaryVariant: '#6c5ce7',
  secondary: '#fd79a8',
  onBackground: '#ffffff',
  onSurface: '#ffffff',
  onPrimary: '#2d3436',
  card: '#2d3436',
  border: '#404040',
  text: '#ffffff',
  subText: '#b2bec3',
  accent: '#00cec9'
};

// Music Context
const MusicContext = createContext();

const MusicProvider = ({ children }) => {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sound, setSound] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  // Initialize audio session
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initializeAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const searchMusic = async (query = 'pop music', limit = 50) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`
      );
      const data = await response.json();
      
      const processedTracks = data.results
        .filter(track => track.previewUrl) // Only include tracks with preview URLs
        .map((track, index) => ({
          id: track.trackId || index,
          title: track.trackName,
          artist: track.artistName,
          album: track.collectionName,
          artwork: track.artworkUrl100?.replace('100x100', '300x300') || track.artworkUrl60,
          previewUrl: track.previewUrl,
          duration: track.trackTimeMillis,
          genre: track.primaryGenreName,
          price: track.trackPrice,
          releaseDate: track.releaseDate
        }));

      setTracks(processedTracks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching music:', error);
      Alert.alert('Error', 'Failed to fetch music tracks');
      setLoading(false);
    }
  };

  const loadAndPlayTrack = async (track) => {
    try {
      setIsBuffering(true);
      
      // Stop and unload previous sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Check if track has preview URL
      if (!track.previewUrl) {
        Alert.alert('Error', 'This track does not have a preview available');
        setIsBuffering(false);
        return;
      }

      // Load new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentTrack(track);
      setIsPlaying(true);
      setIsBuffering(false);
    } catch (error) {
      console.error('Error loading track:', error);
      Alert.alert('Error', 'Failed to load track. Please try again.');
      setIsBuffering(false);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
      setIsBuffering(status.isBuffering);

      // Auto play next track when current ends
      if (status.didJustFinish) {
        nextTrack();
      }
    } else if (status.error) {
      console.error('Playback error:', status.error);
      Alert.alert('Playback Error', 'There was an error playing this track');
    }
  };

  const playTrack = async (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      // Same track, just toggle play/pause
      togglePlayPause();
    } else {
      // Different track, load and play
      await loadAndPlayTrack(track);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const nextTrack = async () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    if (currentIndex < tracks.length - 1) {
      await loadAndPlayTrack(tracks[currentIndex + 1]);
    }
  };

  const previousTrack = async () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    if (currentIndex > 0) {
      await loadAndPlayTrack(tracks[currentIndex - 1]);
    }
  };

  const seekTo = async (value) => {
    try {
      if (sound) {
        await sound.setPositionAsync(value);
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  useEffect(() => {
    searchMusic();
  }, []);

  return (
    <MusicContext.Provider value={{
      tracks,
      currentTrack,
      isPlaying,
      loading,
      isBuffering,
      position,
      duration,
      searchMusic,
      playTrack,
      togglePlayPause,
      nextTrack,
      previousTrack,
      seekTo
    }}>
      {children}
    </MusicContext.Provider>
  );
};

// Custom Hook
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};

// Components
const MusicItem = ({ track, onPress }) => {
  const { theme } = useTheme();
  const { currentTrack, isPlaying, isBuffering } = useMusic();
  
  const formatDuration = (milliseconds) => {
    if (!milliseconds) return '0:00';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isCurrentTrack = currentTrack && currentTrack.id === track.id;
  const showPlayingIndicator = isCurrentTrack && (isPlaying || isBuffering);

  return (
    <TouchableOpacity 
      style={[
        styles.musicItem, 
        { 
          backgroundColor: isCurrentTrack ? theme.primary + '20' : theme.card, 
          borderBottomColor: theme.border 
        }
      ]}
      onPress={() => onPress(track)}
    >
      <Image 
        source={{ uri: track.artwork || 'https://via.placeholder.com/60' }} 
        style={styles.albumArt}
      />
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: isCurrentTrack ? theme.primary : theme.text }]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={[styles.trackArtist, { color: theme.subText }]} numberOfLines={1}>
          {track.artist}
        </Text>
        <Text style={[styles.trackAlbum, { color: theme.subText }]} numberOfLines={1}>
          {track.album} • {track.genre}
        </Text>
      </View>
      <View style={styles.trackMeta}>
        <Text style={[styles.duration, { color: theme.subText }]}>
          {formatDuration(track.duration)}
        </Text>
        {showPlayingIndicator ? (
          <View style={styles.playingIndicator}>
            {isBuffering ? (
              <Ionicons name="refresh" size={20} color={theme.primary} />
            ) : (
              <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={theme.primary} />
            )}
          </View>
        ) : (
          <Ionicons name="play" size={20} color={theme.primary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const Player = () => {
  const { theme } = useTheme();
  const { currentTrack, isPlaying, isBuffering, position, duration, togglePlayPause, nextTrack, previousTrack, seekTo } = useMusic();

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0:00';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <View style={[styles.playerContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <Text style={[styles.noTrackText, { color: theme.subText }]}>
          Select a track to play
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.playerContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
      <Image 
        source={{ uri: currentTrack.artwork || 'https://via.placeholder.com/50' }} 
        style={styles.playerAlbumArt}
      />
      <View style={styles.playerInfo}>
        <Text style={[styles.playerTitle, { color: theme.text }]} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={[styles.playerArtist, { color: theme.subText }]} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={[styles.timeText, { color: theme.subText }]}>
            {formatTime(position)}
          </Text>
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={duration || 30000} // Default to 30 seconds for preview
            value={position}
            onSlidingComplete={seekTo}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.border}
            thumbStyle={{ backgroundColor: theme.primary }}
          />
          <Text style={[styles.timeText, { color: theme.subText }]}>
            {formatTime(duration || 30000)}
          </Text>
        </View>
      </View>
      
      <View style={styles.playerControls}>
        <TouchableOpacity onPress={previousTrack}>
          <Ionicons name="play-skip-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={togglePlayPause} 
          style={[styles.playButton, { backgroundColor: theme.primary }]}
          disabled={isBuffering}
        >
          <Ionicons 
            name={isBuffering ? "refresh" : (isPlaying ? "pause" : "play")} 
            size={28} 
            color={theme.onPrimary} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={nextTrack}>
          <Ionicons name="play-skip-forward" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SearchBar = ({ onSearch }) => {
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    if (searchText.trim()) {
      onSearch(searchText.trim());
    }
  };

  return (
    <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
      <TextInput
        style={[styles.searchInput, { 
          backgroundColor: theme.card, 
          color: theme.text,
          borderColor: theme.primaryVariant 
        }]}
        placeholder="Search for music..."
        placeholderTextColor={theme.subText}
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity 
        style={[styles.searchButton, { backgroundColor: theme.primary }]}
        onPress={handleSearch}
      >
        <Ionicons name="search" size={20} color={theme.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

// Screens
const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { tracks, loading, searchMusic, playTrack } = useMusic();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>Music Player</Text>
        <View style={{ width: 24 }} />
      </View>

      <SearchBar onSearch={searchMusic} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading tracks...</Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MusicItem track={item} onPress={playTrack} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Player />
    </SafeAreaView>
  );
};

const PlaylistScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { tracks, playTrack } = useMusic();

  const favorites = tracks.slice(0, 10); // Mock favorites

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>Favorites</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MusicItem track={item} onPress={playTrack} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <Player />
    </SafeAreaView>
  );
};

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
          onPress={toggleTheme}
        >
          <View style={styles.settingLeft}>
            <Ionicons 
              name={isDarkMode ? "moon" : "sunny"} 
              size={24} 
              color={theme.primary} 
            />
            <Text style={[styles.settingText, { color: theme.text }]}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.subText} />
        </TouchableOpacity>

        <View style={[styles.settingItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <View style={styles.settingLeft}>
            <Ionicons name="volume-high" size={24} color={theme.primary} />
            <Text style={[styles.settingText, { color: theme.text }]}>Audio Quality</Text>
          </View>
          <Text style={[styles.settingValue, { color: theme.subText }]}>High</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Custom Drawer Content
const CustomDrawerContent = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Home', icon: 'home', screen: 'Home' },
    { name: 'Favorites', icon: 'heart', screen: 'Favorites' },
    { name: 'Settings', icon: 'settings', screen: 'Settings' },
  ];

  return (
    <SafeAreaView style={[styles.drawerContainer, { backgroundColor: theme.surface }]}>
      <View style={[styles.drawerHeader, { backgroundColor: theme.primary }]}>
        <Ionicons name="musical-notes" size={40} color={theme.onPrimary} />
        <Text style={[styles.drawerTitle, { color: theme.onPrimary }]}>Music Player</Text>
      </View>

      <View style={styles.drawerContent}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[styles.drawerItem, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Ionicons name={item.icon} size={24} color={theme.primary} />
            <Text style={[styles.drawerItemText, { color: theme.text }]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.drawerFooter}>
        <TouchableOpacity 
          style={[styles.themeToggle, { backgroundColor: theme.card }]}
          onPress={toggleTheme}
        >
          <Ionicons 
            name={isDarkMode ? "sunny" : "moon"} 
            size={20} 
            color={theme.primary} 
          />
          <Text style={[styles.themeToggleText, { color: theme.text }]}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Navigation
const Drawer = createDrawerNavigator();

const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: theme === darkTheme,
        colors: {
          primary: theme.primary,
          background: theme.background,
          card: theme.card,
          text: theme.text,
          border: theme.border,
          notification: theme.secondary,
        },
      }}
    >
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: theme.surface,
            width: width * 0.75,
          },
        }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Favorites" component={PlaylistScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

// Main App Component
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      <MusicProvider>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <AppNavigator />
      </MusicProvider>
    </ThemeContext.Provider>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 140,
  },
  musicItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    marginBottom: 2,
  },
  trackAlbum: {
    fontSize: 12,
  },
  trackMeta: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  duration: {
    fontSize: 12,
    marginBottom: 4,
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 120,
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  noTrackText: {
    textAlign: 'center',
    fontSize: 14,
    flex: 1,
  },
  playerAlbumArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  playerArtist: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 10,
    minWidth: 35,
    textAlign: 'center',
  },
  progressSlider: {
    flex: 1,
    height: 20,
    marginHorizontal: 8,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsContainer: {
    flex: 1,
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 14,
  },
  drawerContainer: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 50,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 16,
  },
  drawerFooter: {
    padding: 20,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  themeToggleText: {
    marginLeft: 8,
    fontSize: 14,
  },
});
