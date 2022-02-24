


import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
// import {getCurrentUser, getUserPayloadByEmail} from './API.js';
// import {cur} from './globals.js';

// SPLASH SCREEN

export default function SplashScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [value, setValue] = useState(false)
  const navigation = useNavigation();

  const componentDidMount = () => {
    AsyncStorage.getItem('Email').then((value) => setSkipValue(value));
  }
  
  const setSkipValue = async (newValue) => {
      setValue(newValue)
      // console.log("Splash1: " + cur.user.name);
      // if (value !== null) {
      //   try {
      //     cur.user = await getUserPayloadByEmail(value);
      //     await AsyncStorage.setItem('User', JSON.stringify(cur.user));
      //   } catch {
      //     cur.user = JSON.parse(await AsyncStorage.getItem('User'));
      //   }
      // }
      // console.log("Splash2: " + cur.user.name);
    }
  
    useEffect(() => {
      componentDidMount();
      console.log(value);
      if (value !== null) {
        if (value != false) {
          navigation.navigate('Main');
        } else {
          navigation.navigate('Login');
        }
      }
    }, [])

    return (
      <View style={{textAlign:'center',alignItems:'center'}}>
        <Text style={{fontSize:22}}>MentoringApp</Text>
      </View>
    )
}