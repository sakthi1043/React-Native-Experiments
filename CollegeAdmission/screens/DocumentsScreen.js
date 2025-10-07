// screens/DocumentsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { 
  FadeInUp,
  SlideInRight,
  ZoomIn,
  LightSpeedInLeft,
  LightSpeedInRight 
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState({
    transcript: null,
    recommendation: null,
    essay: null,
    idProof: null,
    photo: null,
  });

  const documentTypes = [
    {
      key: 'transcript',
      title: 'Academic Transcript',
      description: 'Upload your high school transcript',
      icon: 'school',
      required: true,
    },
    {
      key: 'recommendation',
      title: 'Recommendation Letter',
      description: 'Letter of recommendation from teacher',
      icon: 'description',
      required: true,
    },
    {
      key: 'essay',
      title: 'Personal Essay',
      description: 'Your personal statement essay',
      icon: 'article',
      required: true,
    },
    {
      key: 'idProof',
      title: 'ID Proof',
      description: 'Government issued ID card',
      icon: 'badge',
      required: true,
    },
    {
      key: 'photo',
      title: 'Passport Photo',
      description: 'Recent passport-sized photograph',
      icon: 'photo-camera',
      required: false,
    },
  ];

  const pickDocument = async (documentKey) => {
    try {
      // For web compatibility, use different approach
      if (Platform.OS === 'web') {
        // Create a file input for web
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*';
        
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            setDocuments(prev => ({
              ...prev,
              [documentKey]: {
                name: file.name,
                size: file.size,
                type: file.type,
                uri: URL.createObjectURL(file),
              },
            }));
            Alert.alert('Success', `${file.name} uploaded successfully!`);
          }
        };
        
        input.click();
        return;
      }

      // For mobile (Android/iOS)
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setDocuments(prev => ({
          ...prev,
          [documentKey]: {
            name: result.name,
            size: result.size,
            type: result.mimeType,
            uri: result.uri,
          },
        }));

        Alert.alert('Success', `${result.name} uploaded successfully!`);
      }
    } catch (err) {
      console.log('Document picker error:', err);
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  const removeDocument = (documentKey) => {
    setDocuments(prev => ({
      ...prev,
      [documentKey]: null,
    }));
  };

  const getFileSize = (size) => {
    if (!size) return 'Unknown size';
    if (size < 1024) return `${size} B`;
    if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1048576).toFixed(1)} MB`;
  };

  const renderDocumentCard = (docType, index) => {
    const document = documents[docType.key];
    const isUploaded = !!document;

    return (
      <Animated.View
        entering={LightSpeedInLeft.delay(index * 200).duration(600)}
        key={docType.key}
        style={styles.documentCard}
      >
        <View style={styles.documentHeader}>
          <View style={styles.documentInfo}>
            <Icon name={docType.icon} size={24} color="#3498db" />
            <View style={styles.documentText}>
              <Text style={styles.documentTitle}>{docType.title}</Text>
              <Text style={styles.documentDescription}>{docType.description}</Text>
              {docType.required && (
                <Text style={styles.requiredText}>Required</Text>
              )}
            </View>
          </View>
          
          {isUploaded ? (
            <Animated.View 
              entering={ZoomIn.duration(400)}
              style={styles.uploadedBadge}
            >
              <Icon name="check-circle" size={20} color="#27ae60" />
            </Animated.View>
          ) : (
            <View style={styles.pendingBadge}>
              <Icon name="pending" size={20} color="#e67e22" />
            </View>
          )}
        </View>

        {isUploaded ? (
          <Animated.View 
            entering={SlideInRight.duration(400)}
            style={styles.uploadedFile}
          >
            <View style={styles.fileInfo}>
              <Icon name="insert-drive-file" size={20} color="#7f8c8d" />
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {document.name}
                </Text>
                <Text style={styles.fileSize}>
                  {getFileSize(document.size)}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => removeDocument(docType.key)}
              style={styles.removeButton}
            >
              <Icon name="delete" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <AnimatedTouchable
            entering={FadeInUp.delay(300).duration(400)}
            style={styles.uploadButton}
            onPress={() => pickDocument(docType.key)}
          >
            <Icon name="cloud-upload" size={20} color="#3498db" />
            <Text style={styles.uploadButtonText}>Upload Document</Text>
          </AnimatedTouchable>
        )}
      </Animated.View>
    );
  };

  const getUploadProgress = () => {
    const totalRequired = documentTypes.filter(doc => doc.required).length;
    const uploadedRequired = documentTypes.filter(doc => 
      doc.required && documents[doc.key]
    ).length;
    return (uploadedRequired / totalRequired) * 100;
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View 
        entering={FadeInUp.duration(800)}
        style={styles.header}
      >
        <Text style={styles.title}>Upload Documents</Text>
        <Text style={styles.subtitle}>
          Please upload all required documents for your application
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: `${getUploadProgress()}%`,
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(getUploadProgress())}% Complete
          </Text>
        </View>
      </Animated.View>

      <View style={styles.documentsList}>
        {documentTypes.map((docType, index) => 
          renderDocumentCard(docType, index)
        )}
      </View>

      <AnimatedTouchable
        entering={FadeInUp.delay(1000).duration(600)}
        style={[
          styles.submitButton,
          getUploadProgress() < 100 && styles.submitButtonDisabled
        ]}
        disabled={getUploadProgress() < 100}
        onPress={() => {
          if (getUploadProgress() === 100) {
            Alert.alert('Success', 'All documents submitted successfully!');
          }
        }}
      >
        <Text style={styles.submitButtonText}>
          {getUploadProgress() === 100 ? 'Submit All Documents' : 'Complete All Uploads'}
        </Text>
      </AnimatedTouchable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      }
    })
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  documentsList: {
    padding: 20,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      }
    })
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  documentText: {
    marginLeft: 12,
    flex: 1,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  requiredText: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '600',
  },
  uploadedBadge: {
    padding: 4,
  },
  pendingBadge: {
    padding: 4,
  },
  uploadedFile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dcdee0',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  removeButton: {
    padding: 8,
    marginLeft: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(39, 174, 96, 0.3)',
      },
      default: {
        elevation: 4,
        shadowColor: '#27ae60',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }
    })
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
    ...Platform.select({
      web: {
        boxShadow: 'none',
      },
      default: {
        elevation: 0,
        shadowColor: 'transparent',
      }
    })
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});