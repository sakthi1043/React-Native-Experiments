import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [applications, setApplications] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    course: "",
    address: "",
    transcript: null,
    idProof: null,
    photo: null,
  });

  // Load saved data
  useEffect(() => {
    const loadApps = async () => {
      const data = await AsyncStorage.getItem("applications");
      if (data) setApplications(JSON.parse(data));
    };
    loadApps();
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobile = (mobile) => /^\d{10}$/.test(mobile);

  const pickDocument = async (field) => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if (!result.canceled) {
      setFormData((p) => ({ ...p, [field]: result.assets[0] }));
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setFormData((p) => ({ ...p, photo: result.assets[0] }));
    }
  };

  const handleSubmit = async () => {
    const { fullName, email, mobile, course, address, transcript, idProof, photo } = formData;

    if (
      !fullName ||
      !email ||
      !mobile ||
      !course ||
      !address ||
      !transcript ||
      !idProof ||
      !photo
    ) {
      Alert.alert("Error", "Please fill all required fields and upload documents");
      return;
    }
    if (!validateEmail(email)) return Alert.alert("Error", "Invalid email format");
    if (!validateMobile(mobile)) return Alert.alert("Error", "Mobile number must be 10 digits");

    const newApp = { ...formData, id: Date.now().toString() };
    const updatedApps = [...applications, newApp];
    setApplications(updatedApps);
    await AsyncStorage.setItem("applications", JSON.stringify(updatedApps));

    Alert.alert("Success", "Application Submitted Successfully");
    resetForm();
    setActiveTab(1);
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      mobile: "",
      course: "",
      address: "",
      transcript: null,
      idProof: null,
      photo: null,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>College Admission Portal</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["Admission Form", "Submitted Applications"].map((t, i) => (
          <TouchableOpacity key={t} style={styles.tab} onPress={() => setActiveTab(i)}>
            <Text style={[styles.tabText, activeTab === i && styles.activeTabText]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Admission Form */}
      {activeTab === 0 && (
        <ScrollView style={styles.content}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(t) => setFormData((p) => ({ ...p, fullName: t }))}
            placeholder="Enter full name"
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(t) => setFormData((p) => ({ ...p, email: t }))}
            placeholder="Enter email"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Mobile *</Text>
          <TextInput
            style={styles.input}
            value={formData.mobile}
            onChangeText={(t) => setFormData((p) => ({ ...p, mobile: t }))}
            placeholder="10-digit mobile"
            keyboardType="number-pad"
            maxLength={10}
          />

          <Text style={styles.label}>Course *</Text>
          <TextInput
            style={styles.input}
            value={formData.course}
            onChangeText={(t) => setFormData((p) => ({ ...p, course: t }))}
            placeholder="Enter course"
          />

          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(t) => setFormData((p) => ({ ...p, address: t }))}
            placeholder="Enter address"
            multiline
          />

          <Text style={styles.label}>Upload Transcript *</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={() => pickDocument("transcript")}>
            <Text style={styles.uploadButtonText}>
              {formData.transcript ? "✓ Transcript Selected" : "Choose File"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Upload ID Proof *</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={() => pickDocument("idProof")}>
            <Text style={styles.uploadButtonText}>
              {formData.idProof ? "✓ ID Proof Selected" : "Choose File"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Upload Photo *</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadButtonText}>
              {formData.photo ? "✓ Photo Selected" : "Choose Photo"}
            </Text>
          </TouchableOpacity>
          {formData.photo && (
            <Image source={{ uri: formData.photo.uri }} style={styles.photoPreview} />
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Application</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Submitted Applications */}
      {activeTab === 1 && (
        <ScrollView style={styles.content}>
          {applications.length === 0 ? (
            <Text style={styles.noApp}>No applications submitted yet.</Text>
          ) : (
            applications.map((app) => (
              <View key={app.id} style={styles.appCard}>
                <Text style={styles.appTitle}>{app.fullName}</Text>
                <Text>Email: {app.email}</Text>
                <Text>Mobile: {app.mobile}</Text>
                <Text>Course: {app.course}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingTop: Platform.OS === "ios" ? 50 : 30 },
  header: { backgroundColor: "#2c3e50", padding: 20, alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  tabContainer: { flexDirection: "row", backgroundColor: "white" },
  tab: { flex: 1, padding: 15, alignItems: "center" },
  tabText: { fontSize: 14, color: "#7f8c8d" },
  activeTabText: { color: "#3498db", fontWeight: "bold" },
  content: { padding: 20 },
  label: { fontSize: 15, fontWeight: "600", color: "#2c3e50", marginTop: 10 },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 5,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  uploadButton: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    alignItems: "center",
  },
  uploadButtonText: { color: "white", fontWeight: "bold" },
  submitButton: {
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  photoPreview: { width: 100, height: 100, borderRadius: 50, marginTop: 10, alignSelf: "center" },
  noApp: { textAlign: "center", marginTop: 30, color: "#7f8c8d" },
  appCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  appTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
});