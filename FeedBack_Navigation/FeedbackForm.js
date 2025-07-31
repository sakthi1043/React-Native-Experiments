import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Formik } from 'formik';
import * as Yup from 'yup';

const feedbackSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  course: Yup.string().required('Please select a course'),
  rating: Yup.string().required('Rating is required'),
});

export default function FeedbackFormScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Event Feedback Form</Text>

      <Formik
        initialValues={{ name: '', email: '', course: '', rating: '' }}
        validationSchema={feedbackSchema}
        onSubmit={(values, { resetForm }) => {
          resetForm();
          navigation.navigate('ThankYou', { feedback: values });
        }}
      >
        {({ handleChange, handleSubmit, setFieldValue, values, errors, touched, resetForm }) => (
          <View style={styles.formContainer}>
            {/* Name */}
            <TextInput
              style={[styles.input, touched.name && errors.name && styles.errorBorder]}
              placeholder="Enter your name"
              value={values.name}
              onChangeText={handleChange('name')}
            />
            {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {/* Email */}
            <TextInput
              style={[styles.input, touched.email && errors.email && styles.errorBorder]}
              placeholder="Enter your email"
              value={values.email}
              onChangeText={handleChange('email')}
              keyboardType="email-address"
            />
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Course Dropdown */}
            <Text style={styles.label}>Select Course:</Text>
            <Picker
              selectedValue={values.course}
              onValueChange={(itemValue) => setFieldValue('course', itemValue)}
              style={[styles.picker, touched.course && errors.course && styles.errorBorder]}
            >
              <Picker.Item label="Select course..." value="" />
              <Picker.Item label="React Native" value="React Native" />
              <Picker.Item label="Data Science" value="Data Science" />
              <Picker.Item label="AI & ML" value="AI & ML" />
            </Picker>
            {touched.course && errors.course && <Text style={styles.errorText}>{errors.course}</Text>}

            {/* Rating Dropdown */}
            <Text style={styles.label}>Rate your learning experience (1-5):</Text>
            <Picker
              selectedValue={values.rating}
              onValueChange={(itemValue) => setFieldValue('rating', itemValue)}
              style={[styles.picker, touched.rating && errors.rating && styles.errorBorder]}
            >
              <Picker.Item label="Select rating..." value="" />
              <Picker.Item label="1 - Poor" value="1" />
              <Picker.Item label="2 - Fair" value="2" />
              <Picker.Item label="3 - Good" value="3" />
              <Picker.Item label="4 - Very Good" value="4" />
              <Picker.Item label="5 - Excellent" value="5" />
            </Picker>
            {touched.rating && errors.rating && <Text style={styles.errorText}>{errors.rating}</Text>}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button title="Submit" onPress={handleSubmit} color="#4CAF50" />
              <View style={styles.buttonSpacer} />
              <Button title="Clear" onPress={() => resetForm()} color="gray" />
            </View>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F0F0', // Light background color
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  errorBorder: {
    borderColor: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonSpacer: {
    width: 10,
  },
});
