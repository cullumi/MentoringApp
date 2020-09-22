import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, AsyncStorage, StyleSheet, Text, Image, Button, View, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import LinkedInModal from 'react-native-linkedin';
import Storage from './localstorage';

const Stack = createStackNavigator();

// measurements and styles

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const windowHeight6 = windowHeight / 6;
const titleWidth = windowWidth - 100;
const mainButtonWidth = windowWidth - 50;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  }
})

// Functions for generating various pages below.

const HomeScreen = ({ navigation }) => {
  return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        <View style={{height:10, width:windowWidth}} />
        <View style={{width: windowWidth, flexDirection: 'row-reverse', alignItems:'center'}}>
          <View style={{width: 25}} />
          <Button style={{width: mainButtonWidth, height: 60, backgroundColor: 'blue'}} />
        </View>
      </View>
  );
};

const MeetingsScreen = () => {
  return <Text></Text>;
};

const ViewDebriefScreen = () => {
  return <Text></Text>;
};

const MessagingScreen = () => {
  return <Text></Text>;
};

const HelpScreen = () => {
  return <Text></Text>;
};

const SubmitDebriefScreen = () => {
  return <Text></Text>;
};

const LoginScreen = () => {
  return <View style={styles.container}>
          <LinkedInModal
            clientID="86bzo41s6bc4am"
            clientSecret="O2U1ANijJnQG2E3s"
            redirectUri="https://cs.wwu.edu/"
            onSuccess={token => console.log(token)}
          />
        </View>;
};

const PrivacyScreen = () => {
  return <Text></Text>;
};

// Main class for app. Responsible for rendering app container.
export default class AppContainer extends React.Component {
  // Main rendering function. Detects whether user is signed in, then brings them to Home or Login.
  render() {
    // The false == false below was signedIn == false
    return (
        <NavigationContainer>
          <Stack.Navigator>
            {true == false ? [
              <Stack.Screen
                name="Login"
                component={LoginScreen}
              />,
              <Stack.Screen name="Privacy" component={PrivacyScreen} />
            ] : [
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  headerTitle: "Messages",
                  headerRight: () => (
                    <View style={{flexDirection:'row'}}>
                    <TouchableOpacity onPress={() => alert('This is a button!')} activeOpacity={0.5}>
                      <Image style={{width:30, height:30}} source={require('./assets/help.png')} />
                    </TouchableOpacity>
                    <View style={{width:5}} />
                    </View>
                  ),
                }}
              />,
              <Stack.Screen name="Meetings" component={MeetingsScreen} />,
              <Stack.Screen name="ViewDebrief" component={ViewDebriefScreen} />,
              <Stack.Screen name="Messaging" component={MessagingScreen} />,
              <Stack.Screen name="Help" component={HelpScreen} />,
              <Stack.Screen name="SubmitDebrief" component={SubmitDebriefScreen} />
            ]}
          </Stack.Navigator>
        </NavigationContainer>
    );
  }

};
