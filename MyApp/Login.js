import React,{useState} from "react";
import {View,Text,TextInput,Button,StyleSheet,Alert, Touchable, TouchableOpacity,Image } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function Login(){
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const navigation=useNavigation();
    const handleLogin=()=>{
      if(email=="sakthi1043@gmail.com" && password=="sakthi1043")
      {
          Alert.alert("Login Successfully");
          navigation.navigate("Geopage");
      }
      else
      {
        Alert.alert("Login Failed");
      }
    }

    return(
      <View style={styles.container}>
        <Image
          source={require('./assets/image3.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Login Page</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"      
          />
        </View>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <View style={styles.signup}>
            <Text style={styles.signupText}>Don't have an account? <Text style={styles.register}>Register</Text></Text>
          </View>
      </View>
    )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    padding: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputBox:{
    backgroundColor:"#e5e5e5",
    borderRadius:50,
    marginTop:10,
    padding:3,
  },
  input: {
    // borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
    color:"#333446",
    marginBottom: 5,
    marginLeft:10,
    paddingVertical: 10,

  },
  button: {
    backgroundColor: '#ffd000',
    color:"#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderRadius:50,
  },
  buttonText: {
    textAlign: 'center',
    color: '#111',
    fontWeight: 'bold',
  },
  signup:{
    padding:15,
    marginTop:10,
  },
  signupText:{
    textAlign:'center',
    fontWeight:'black',
    color:'#333446',
  },
  register:{
    color:'#ffd000',
    textDecorationLine:'underline',
    fontWeight:'bold',
  },
  logo:{
    width:200,
    height:200,
    resizeMode:'contain',
    alignSelf:'center',
    marginBottom:20,
  }
});
