


import React, {useState, useEffect} from 'react';
import {View, Text, AsyncStorage} from 'react-native';
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

/*
// For checking user login status...
export default class SplashScreen extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        refreshing : false,
        value: null
      };
    }
  
    componentDidMount = () => AsyncStorage.getItem('Email').then((value) => this.setSkipValue(value));
  
    async setSkipValue (newValue) {
      this.setState({ value: newValue });
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
  
    render () {

      if (this.value != false) {
        if (this.value !== null) {
          this.props.navigation.navigate('Main');
        } else {
          this.props.navigation.navigate('Login');
        }
      }
      return (
        <View style={{textAlign:'center',alignItems:'center'}}>
          <Text style={{fontSize:22}}>MentoringApp</Text>
        </View>
      )
    }
  
  };
  */