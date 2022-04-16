



import React, {useState} from 'react';
import {View, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from 'react-native-button';
import LinkedInModal from 'react-native-linkedin';
import { useNavigation } from '@react-navigation/native';
import {styles, colors} from './Styles.js';
import {getCurrentUser, initializeUser} from './API.js';
import {registerForPushNotifications} from './PushNotifs.js';
import {url, setLocalUser, setLinkedInToken, debug} from './globals.js';
import { setStatusBarNetworkActivityIndicatorVisible } from 'expo-status-bar';

// LOGIN AND PRIVACY SCREENS

const linkedInClientId = "86w6fxbbujlvnb" //"86bzo41s6bc4am"
const linkedInClientSecret = "vXprrY81P3JisVKx" //"O2U1ANijJnQG2E3s"
const linkedInRedirectUri = "https://cs.wwu.edu/"

export default function LoginScreen() {
  // isLoggedIn doesn't actually get used it seems?
  //const [isLoggedIn, setIsLoggedIn] = useState(false);  // Maybe shouldn't use state... look into to proper conversion?
  const [refreshing, setRefreshing] = useState(false);
  const [valid, setValid] = useState(false);
  const navigation = useNavigation();
  var modal;

  async function fetchUsing(url, bearer, ender='') {
    var resp;
    if (!bearer) {
      resp = await fetch(url + ender, {
        method: 'GET'
      });
    } else {
      resp = await fetch(url + ender, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + bearer,
        }
      });
    }
    const payload = await resp.json();
    return payload;
  }

  const getLinkedInProfileInfo = async (access_token) => {
    console.log("Getting LinkedIn profile information...");
    return await fetchUsing('https://api.linkedin.com/v2/me', access_token)
    // // get basic profile information
    // const response = await fetch('https://api.linkedin.com/v2/me', {
    //   method: 'GET',
    //   headers: {
    //     Authorization: 'Bearer ' + access_token,
    //   }
    // });
    // const payload = await response.json();
    // return payload;
  }

  const getLinkedInProfilePicture = async (access_token) => {
    console.log("Getting LinkedIn profile picutre...");
    return await fetchUsing('https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))&oauth2_access_token=', null, access_token);
    // // get profile picture URL
    // const url = 'https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))&oauth2_access_token='
    // const pictureres = await fetch(url + access_token, {
    //   method: 'GET'
    // });
    // const picPayload = await pictureres.json();
    // return picPayload;
  }

  const getLinkedInProfileEmail = async (access_token) => {
    console.log("Getting LinkedIn email address...");
    return await fetchUsing('https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))', access_token);
    // // get email address
    // const emailres = await fetch('https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))', {
    //   method: 'GET',
    //   headers: {
    //     Authorization: 'Bearer ' + access_token,
    //   }
    // });
    // const emailPayload = await emailres.json();
    // return emailPayload;
  }

  const handleLoginNavigation = async (email, last, first, pic) => {
    
    // Check if user exists in database before ensuring it exists.
    // console.log("Checking if user exists in database...");
    // const authPayload = await initializeUser('Login-Direct');
    // if (authPayload !== null) {}

    // Get Current User.
    console.log("Ensuring user exists...");
    let curUser = await getCurrentUser("Login");

    // Check if debugging is active
    if (debug){
      // await AsyncStorage.setItem('User', JSON.stringify(curUser));
      console.log("Debug --> Navigate to Main Screen");
      navigation.navigate('Main');
      return;
    }

    // Check if this user needs to be added to DB.
    // if (authPayload.rowsAffected == 0) {
    console.log('handleLoginNavigation:', curUser);
    let existed = false;
    if (!!curUser != false) {
      if (!existed) {
        // postNewUser(email, first, last, pic);
        await AsyncStorage.setItem('User', JSON.stringify(curUser));
        navigation.navigate('Privacy');
      } else {
        await AsyncStorage.setItem('User', JSON.stringify(curUser));
        navigation.navigate('Main');
      }
    }
  }

  // handles fetching of login information; Note: payload contains profile information upon a successful login.
  const handleLogin = async (data) => {
    const { access_token, authentication_code } = data;

    console.log("Handling Login");
    if (!authentication_code) {

      setRefreshing(true);

      console.log("Fetching authentication code...");
      await setLinkedInToken(access_token);

      // Getting LinkedIn Payloads
      const payload = await getLinkedInProfileInfo(access_token);
      const picPayload = await getLinkedInProfilePicture(access_token);
      const emailPayload = await getLinkedInProfileEmail(access_token);

      const email = emailPayload.elements[0]["handle~"].emailAddress;
      const first = payload.localizedFirstName;
      const last = payload.localizedLastName;
      const pic = picPayload.profilePicture["displayImage~"].elements[2].identifiers[0].identifier;

      // Constructing user details...
      console.log("Constructing user details...");
      try {
        await AsyncStorage.setItem('Email', email);
        await AsyncStorage.setItem('FirstName', first);
        await AsyncStorage.setItem('LastName', last);
        await AsyncStorage.setItem('Avatar', pic);
      } catch (error) {
        console.log(error);
      }
      await handleLoginNavigation(email, first, last, pic);

      setRefreshing(false);
      setValid(true);

    } else {
      console.log("Authentication Code Received: " + authentication_code);
    }
  }

  const renderButton = () => {
    return (
      <Button
        containerStyle={{padding:12, height:45, width:"45%", overflow:'hidden', borderRadius:4, backgroundColor: '#003F87'}}
        style={{fontSize: 16, color: 'white'}}
        onPress={() => modal.open()}>
          Sign in with LinkedIn
      </Button>
    );
  };

  return (
    <View style={styles.container}>
      <Image style={{width:200, height:200}} source={require('../assets/logo.png')} />
      <View style={{height:20}} />
      <LinkedInModal
          clientID={linkedInClientId}
          clientSecret={linkedInClientSecret}
          redirectUri={linkedInRedirectUri}
          ref={ref => { modal = ref; }}
          renderButton={renderButton}
          onSuccess={data => {
              handleLogin(data);
              // if (valid) {
              //     navigation.navigate('Privacy');
              // }
          }}
      />
    </View>
  );
}