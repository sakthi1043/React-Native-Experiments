// screens/AdmissionFormScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { 
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInLeft 
} from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AdmissionFormScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    highSchool: '',
    gpa: '',
    intendedMajor: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.highSchool.trim()) newErrors.highSchool = 'High school name is required';
    
    if (!formData.gpa.trim()) {
      newErrors.gpa = 'GPA is required';
    } else if (isNaN(formData.gpa) || formData.gpa < 0 || formData.gpa > 4.0) {
      newErrors.gpa = 'GPA must be between 0.0 and 4.0';
    }

    if (!formData.intendedMajor.trim()) newErrors.intendedMajor = 'Intended major is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Simulate API call
      Alert.alert(
        'Success!',
        'Your application has been submitted successfully!',
        [{ text: 'OK', onPress: () => console.log('Application submitted') }]
      );
      console.log('Form Data:', formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderInput = (field, label, placeholder, keyboardType = 'default', index) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(500)}
      style={styles.inputContainer}
    >
      <Text style={styles.label}>{label}</Text>
      <AnimatedTextInput
        style={[styles.input, errors[field] && styles.inputError]}
        placeholder={placeholder}
        value={formData[field]}
        onChangeText={(value) => handleChange(field, value)}
        keyboardType={keyboardType}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.Text 
          entering={FadeInUp.duration(800)}
          style={styles.title}
        >
          College Admission Form
        </Animated.Text>

        <Animated.Text 
          entering={FadeInUp.delay(200).duration(800)}
          style={styles.subtitle}
        >
          Please fill out all required fields
        </Animated.Text>

        {/* Personal Information */}
        <Animated.View 
          entering={SlideInRight.duration(600)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {renderInput('firstName', 'First Name *', 'Enter your first name', 'default', 0)}
          {renderInput('lastName', 'Last Name *', 'Enter your last name', 'default', 1)}
          {renderInput('email', 'Email *', 'Enter your email', 'email-address', 2)}
          {renderInput('phone', 'Phone *', 'Enter your phone number', 'phone-pad', 3)}
          {renderInput('dateOfBirth', 'Date of Birth *', 'MM/DD/YYYY', 'default', 4)}
        </Animated.View>

        {/* Address Information */}
        <Animated.View 
          entering={SlideInLeft.duration(600)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Address Information</Text>
          {renderInput('address', 'Street Address', 'Enter your address', 'default', 5)}
          {renderInput('city', 'City', 'Enter your city', 'default', 6)}
          {renderInput('state', 'State', 'Enter your state', 'default', 7)}
          {renderInput('zipCode', 'ZIP Code', 'Enter ZIP code', 'number-pad', 8)}
        </Animated.View>

        {/* Academic Information */}
        <Animated.View 
          entering={SlideInRight.duration(600)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Academic Information</Text>
          {renderInput('highSchool', 'High School *', 'High school name', 'default', 9)}
          {renderInput('gpa', 'GPA *', '0.0 - 4.0', 'decimal-pad', 10)}
          {renderInput('intendedMajor', 'Intended Major *', 'e.g., Computer Science', 'default', 11)}
        </Animated.View>

        {/* Emergency Contact */}
        <Animated.View 
          entering={SlideInLeft.duration(600)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          {renderInput('emergencyContact', 'Emergency Contact Name', 'Full name', 'default', 12)}
          {renderInput('emergencyPhone', 'Emergency Contact Phone', 'Phone number', 'phone-pad', 13)}
        </Animated.View>

        <AnimatedTouchable
          entering={FadeInUp.delay(1400).duration(600)}
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Application</Text>
        </AnimatedTouchable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dcdee0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});