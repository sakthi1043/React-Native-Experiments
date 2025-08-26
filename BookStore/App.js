import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const backgroundImage = require('./assets/bg1.jpg');
const Stack = createStackNavigator();

function AddBookScreen({ navigation }) {
  const [bookName, setBookName] = useState('');
  const [isbn, setIsbn] = useState('');
  const [books, setBooks] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadBooks = async () => {
        try {
          const storedBooks = await AsyncStorage.getItem('books');
          setBooks(storedBooks ? JSON.parse(storedBooks) : []);
        } catch (error) {
          console.error('Error loading books:', error);
        }
      };
      loadBooks();
    }, [])
  );

  const addBook = async () => {
    if (!bookName || !isbn) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }

    if (!/^\d{10}$|^\d{13}$/.test(isbn)) {
      Alert.alert('Error', 'ISBN must be exactly 10 or 13 digits.');
      return;
    }

    try {
      const storedBooks = await AsyncStorage.getItem('books');
      const currentBooks = storedBooks ? JSON.parse(storedBooks) : [];

      const newBook = { name: bookName, isbn };
      const updatedBooks = [...currentBooks, newBook];

      await AsyncStorage.setItem('books', JSON.stringify(updatedBooks));
      setBooks(updatedBooks);

      setBookName('');
      setIsbn('');
      Alert.alert('Success', 'Book added successfully!');
    } catch (error) {
      console.error('Error saving books:', error);
      Alert.alert('Error', 'Failed to save book');
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.overlay} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>BookStore</Text>

        <Text style={styles.label}>Book Name</Text>
        <TextInput
          placeholder="Enter book title"
          value={bookName}
          onChangeText={setBookName}
          style={styles.input}
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>ISBN Number</Text>
        <TextInput
          placeholder="Enter ISBN number"
          value={isbn}
          onChangeText={setIsbn}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity style={styles.button} onPress={addBook}>
          <Text style={styles.buttonText}>Add Book</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#3c8dbc' }]}
          onPress={() => navigation.navigate('ShowBooks')}
        >
          <Text style={styles.buttonText}>Show Books</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

function ShowBooksScreen() {
  const [books, setBooks] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadBooks = async () => {
        try {
          const storedBooks = await AsyncStorage.getItem('books');
          setBooks(storedBooks ? JSON.parse(storedBooks) : []);
        } catch (error) {
          console.error('Error loading books:', error);
        }
      };
      loadBooks();
    }, [])
  );

  const deleteBook = async (indexToDelete) => {
    try {
      const updatedBooks = books.filter((_, index) => index !== indexToDelete);
      await AsyncStorage.setItem('books', JSON.stringify(updatedBooks));
      setBooks(updatedBooks);
    } catch (error) {
      console.error('Error deleting book:', error);
      Alert.alert('Error', 'Failed to delete book.');
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <View style={[styles.overlay, { flex: 1 }]}>
        <Text style={styles.title}>Book List</Text>

        {books.length === 0 ? (
          <Text style={styles.noData}>No books added yet.</Text>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            data={books}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={true}
            renderItem={({ item, index }) => (
              <View style={styles.bookCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardText}>ISBN: {item.isbn}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#d9534f', paddingVertical: 8, paddingHorizontal: 12 }]}
                    onPress={() => deleteBook(index)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ImageBackground>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AddBook">
        <Stack.Screen name="AddBook" component={AddBookScreen} />
        <Stack.Screen name="ShowBooks" component={ShowBooksScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flexGrow: 1,
    padding: 25,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    color: '#eee',
    marginBottom: 5,
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#ffffff22',
    padding: 12,
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  button: {
    backgroundColor: '#00a65a',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  bookCard: {
    backgroundColor: '#ffffffcc',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  cardText: {
    fontSize: 16,
    marginTop: 5,
    color: '#444',
  },
  noData: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

