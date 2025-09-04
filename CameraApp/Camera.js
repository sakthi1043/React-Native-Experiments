import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Image, 
  Dimensions,
  SafeAreaView,
  Modal,
  ScrollView
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window');

const Camera = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [flashMode, setFlashMode] = useState('off');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef(null);

  useEffect(() => {
    if (capturedImage) {
      // Start fade-in animation when image is captured
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [capturedImage]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to use the camera</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo.uri);
        setShowFilters(true);
      } catch (error) {
        console.log('Error taking picture:', error);
      }
    }
  };

  const applyFilter = async (filter) => {
    setSelectedFilter(filter);
    
    if (filter === 'normal') {
      // No filter needed for normal
      return;
    }
    
    try {
      let manipulations = [];
      
      switch(filter) {
        case 'sepia':
          manipulations.push({ filter: 'sepia' });
          break;
        case 'blackAndWhite':
          manipulations.push({ filter: 'grayscale' });
          break;
        case 'warm':
          manipulations.push({ filter: 'warm' });
          break;
        case 'cool':
          manipulations.push({ filter: 'cool' });
          break;
        case 'vintage':
          manipulations.push({ filter: 'vintage' });
          break;
        default:
          break;
      }
      
      const result = await ImageManipulator.manipulateAsync(
        capturedImage,
        manipulations,
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      setCapturedImage(result.uri);
    } catch (error) {
      console.log('Error applying filter:', error);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashMode(current => (current === 'off' ? 'on' : 'off'));
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setShowFilters(false);
    setSelectedFilter('normal');
  };

  const savePicture = () => {
    // In a real app, you would save the image to the device's gallery here
    alert('Image saved successfully!');
    retakePicture();
  };

  const FilterButton = ({ name, label, onPress, isSelected }) => (
    <TouchableOpacity 
      style={[styles.filterButton, isSelected && styles.selectedFilterButton]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isSelected && styles.selectedFilterButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {!capturedImage ? (
        <CameraView 
          style={styles.camera} 
          facing={facing}
          flash={flashMode}
          ref={cameraRef}
        >
          <View style={styles.controls}>
            
            
            <View style={styles.bottomControls}>
              <View style={styles.topControls}>
              <TouchableOpacity style={styles.button} onPress={toggleFlash}>
                <Text style={styles.buttonText}>
                  Flash: {flashMode === 'on' ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                <Text style={styles.buttonText}>Flip Camera</Text>
              </TouchableOpacity>
            </View>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureInnerCircle} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      ) : (
        <Animated.View style={[styles.previewContainer, { opacity: fadeAnim }]}>
          <Image 
            source={{ uri: capturedImage }} 
            style={styles.previewImage} 
          />
          
          <Modal
            animationType="slide"
            transparent={true}
            visible={showFilters}
            onRequestClose={() => setShowFilters(false)}
          >
            <View style={styles.filterModal}>
              <View style={styles.filterContent}>
                <Text style={styles.filterTitle}>Choose a Filter</Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterOptions}>
                    <FilterButton 
                      name="normal" 
                      label="Normal" 
                      onPress={() => applyFilter('normal')} 
                      isSelected={selectedFilter === 'normal'}
                    />
                    <FilterButton 
                      name="sepia" 
                      label="Sepia" 
                      onPress={() => applyFilter('sepia')} 
                      isSelected={selectedFilter === 'sepia'}
                    />
                    <FilterButton 
                      name="blackAndWhite" 
                      label="B&W" 
                      onPress={() => applyFilter('blackAndWhite')} 
                      isSelected={selectedFilter === 'blackAndWhite'}
                    />
                    <FilterButton 
                      name="warm" 
                      label="Warm" 
                      onPress={() => applyFilter('warm')} 
                      isSelected={selectedFilter === 'warm'}
                    />
                    <FilterButton 
                      name="cool" 
                      label="Cool" 
                      onPress={() => applyFilter('cool')} 
                      isSelected={selectedFilter === 'cool'}
                    />
                    <FilterButton 
                      name="vintage" 
                      label="Vintage" 
                      onPress={() => applyFilter('vintage')} 
                      isSelected={selectedFilter === 'vintage'}
                    />
                  </View>
                </ScrollView>
                
                <View style={styles.filterActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.retakeButton]}
                    onPress={retakePicture}
                  >
                    <Text style={styles.actionButtonText}>Retake</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={savePicture}
                  >
                    <Text style={styles.actionButtonText}>Save Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#2e64e5',
    padding: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    // flex: 1,
  },
  controls: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bottomControls: {
    marginTop: 800,
    alignItems: 'center',
    marginBottom: 30,
  },
  button: {
    marginRight: 58,
    marginLeft: 58,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  captureButton: {
    marginTop:20,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  previewImage: {
    width: width,
    height: height * 0.7,
    resizeMode: 'contain',
  },
  filterModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  filterContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 250,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  filterOptions: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
    minWidth: 70,
    alignItems: 'center',
  },
  selectedFilterButton: {
    backgroundColor: '#2e64e5',
  },
  filterButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedFilterButtonText: {
    color: 'white',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#2e64e5',
  },
  actionButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Camera;