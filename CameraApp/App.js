import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Animated, SafeAreaView, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('sepia');
  const [cameraActive, setCameraActive] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  const getFilterStyle = (filter) => {
    switch(filter) {
      case 'sepia':
        return { filter: 'sepia(1)' };
      case 'blackandwhite':
        return { filter: 'grayscale(1)' };
      case 'warm':
        return { filter: 'sepia(0.5) hue-rotate(-20deg) saturate(1.2)' };
      case 'cool':
        return { filter: 'hue-rotate(180deg) saturate(0.8) brightness(1.1)' };
      case 'invert':
        return { filter: 'invert(1)' };
      case 'vintage':
        return { filter: 'sepia(0.7) contrast(1.2) brightness(0.9)' };
      case 'blur':
        return { filter: 'blur(5px)' };
      case 'sharpen':
        return { filter: 'contrast(1.5) saturate(1.5)' };
      default:
        return { filter: 'sepia(1)' };
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          exif: false
        });
        
        setCapturedImage(photo.uri);
        setCameraActive(false);
        
        // Start the fade-in animation
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.log('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const startCamera = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
    setCameraActive(true);
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setCameraActive(false);
  };

  const getFilterName = () => {
    switch(selectedFilter) {
      case 'sepia': return 'Sepia';
      case 'blackandwhite': return 'Black & White';
      case 'warm': return 'Warm';
      case 'cool': return 'Cool';
      case 'invert': return 'Invert';
      case 'vintage': return 'Vintage';
      case 'blur': return 'Blur';
      case 'sharpen': return 'Sharpen';
      default: return 'Sepia';
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to use the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cameraActive) {
    return (
      <SafeAreaView style={styles.container}>
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          facing="back"
        />
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setCameraActive(false)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContainer}>
          <Animated.View style={[{ opacity: fadeAnim }, styles.imageContainer]}>
            <Image 
              source={{ uri: capturedImage }} 
              style={[styles.previewImage, getFilterStyle(selectedFilter)]}
            />
          </Animated.View>
          <Text style={styles.filterText}>{getFilterName()} Filter Applied</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.retakeButton]} onPress={retakePicture}>
            <Text style={styles.buttonText}>Take Another Photo</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Snapify</Text>
        <Text style={styles.subtitle}>Pick a filter, then take a snap!</Text>
        
        <View style={styles.filterSelectorContainer}>
          <Text style={styles.filterLabel}>Filters:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {['sepia', 'blackandwhite', 'warm', 'cool', 'invert', 'vintage', 'blur', 'sharpen'].map((filter) => (
              <TouchableOpacity 
                key={filter}
                style={[styles.filterOption, selectedFilter === filter && styles.selectedFilter]} 
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={styles.filterOptionText}>
                  {filter === 'blackandwhite' ? 'B&W' : 
                   filter === 'sepia' ? 'Sepia' :
                   filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.selectedFilterContainer}>
          <Text style={styles.selectedFilterText}>
            Filter: {getFilterName()}
          </Text>
        </View>

        <TouchableOpacity style={styles.cameraButton} onPress={startCamera}>
          <Text style={styles.cameraButtonText}>Open Camera</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0', 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    color: '#333', 
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#00796B', 
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#607D8B',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  filterSelectorContainer: {
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  filterLabel: {
    color: '#00796B',
    fontSize: 22,
    marginBottom: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  filterScrollContent: {
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  filterOption: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    marginHorizontal: 12,
    backgroundColor: '#ffffff', 
    borderRadius: 35,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  selectedFilter: {
    backgroundColor: '#00796B', 
    borderWidth: 2,
    borderColor: '#FFF',
  },
  filterOptionText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedFilterContainer: {
    marginBottom: 40,
  },
  selectedFilterText: {
    color: '#00796B',
    fontSize: 20,
    fontWeight: '600',
  },
  cameraButton: {
    backgroundColor: '#00796B', 
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 40,
    marginTop: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cameraButtonText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#ffffff',
    marginBottom: 20,
  },
  captureButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00796B', 
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#00796B', 
    padding: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: '75%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    resizeMode: 'contain',
  },
  filterText: {
    color: '#00796B',
    fontSize: 24,
    marginTop: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 25,
    backgroundColor: '#F0F0F0',
    width: '100%',
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#FFC107', 
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
