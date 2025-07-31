import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';

{/* <Picker
selectedValue={itemValue}
onValueChange={(value, index) => setItemValue(value)}
>
<Picker.Item label="Option A" value="A" />
<Picker.Item label="Option B" value="B" />
</Picker> */}


const courses = ['React Native', 'Angular', 'Vue', 'Node.js'];

export default function FeedbackForm({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [rate, setRate] = useState('5');

  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    // Simple regex for email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validate = () => {
    let tempErrors = {};
    if (!name.trim()) tempErrors.name = 'Name is required';
    if (!email.trim()) tempErrors.email = 'Email is required';
    else if (!validateEmail(email)) tempErrors.email = 'Email is invalid';

    if (!course) tempErrors.course = 'Please select a course';

    const rateNum = parseInt(rate);
    if (isNaN(rateNum) || rateNum < 1 || rateNum > 10) {
      tempErrors.rate = 'Rate must be between 1 and 10';
    }

    setErrors(tempErrors);

    return Object.keys(tempErrors).length === 0;
  };

  const onSubmit = () => {
    if (validate()) {
      // You can handle your form data here (e.g., send to server)
      console.log({ name, email, course, rate });
      navigation.navigate('ThankYou');
    } else {
      Alert.alert('Validation failed', 'Please fix the errors before submitting.');
    }
  };

  const onClear = () => {
    setName('');
    setEmail('');
    setCourse('');
    setRate('5');
    setErrors({});
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.field}>
        <Text>Name:</Text>
        <TextInput
          style={[styles.input, errors.name && styles.errorBorder]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.field}>
        <Text>Email:</Text>
        <TextInput
          style={[styles.input, errors.email && styles.errorBorder]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="Enter your email"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.field}>
        <Text>Course:</Text>
        <View
          style={[
            styles.pickerContainer,
            errors.course && styles.errorBorder,
          ]}
        >
          <Picker
            selectedValue={course}
            onValueChange={(itemValue) => setCourse(itemValue)}
          >
            <Picker.Item label="-- Select Course --" value="" />
            {courses.map((c, idx) => (
              <Picker.Item key={idx} label={c} value={c} />
            ))}
          </Picker>
        </View>
        {errors.course && <Text style={styles.errorText}>{errors.course}</Text>}
      </View>

      <View style={styles.field}>
        <Text>Rate your learning experience: {rate}</Text>
        <TextInput
          style={[styles.input, errors.rate && styles.errorBorder]}
          value={rate}
          onChangeText={(text) => {
            // allow only numbers between 1 and 10
            if (/^\d*$/.test(text)) setRate(text);
          }}
          keyboardType="numeric"
          placeholder="1 to 10"
          maxLength={2}
        />
        {errors.rate && <Text style={styles.errorText}>{errors.rate}</Text>}
      </View>

      <View style={styles.buttons}>
        <Button title="Submit" onPress={onSubmit} />
        <View style={{ width: 10 }} />
        <Button title="Clear" color="gray" onPress={onClear} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#777',
    padding: 8,
    marginTop: 5,
    borderRadius: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 4,
    marginTop: 5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  errorText: {
    color: 'red',
    marginTop: 3,
  },
  errorBorder: {
    borderColor: 'red',
  },
});
