import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, AsyncStorage, StyleSheet, Text, Image, Button, View, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import LinkedInModal from 'react-native-linkedin';
// import Storage from './localstorage';

const Stack = createStackNavigator();

// measurements and styles

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const windowHeight6 = windowHeight / 6;
const mainWidth = windowWidth - 50;
const mainConversationWidth = windowWidth - 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  MentorBox: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#006B3F',
    padding: 1,
    backgroundColor: '#338965'
  },

  MentorTag: {
    textAlign: 'center',
    color:'white',
    padding:3,
    fontSize: 12
  }
})


// Functions for generating various pages below.

// Get necessary data for HomeScreen.

// accountType: 0 - not verified, please wait until admins pair you with mentor/mentees
//              1 - verified, check for conversations to display
// const accountType = Storage.getItem('accountType'); 
const accountType = 0;
const HomeScreen = ({ navigation }) => {
  return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        {accountType == 1 ? [
          <View style={{height:50, width:windowWidth}} />,
          <View style={{width: windowWidth, flexDirection: 'row-reverse', alignItems:'center'}}>
            <View style={{width: 25}} />
            <View style={{width: mainWidth, alignItems:'center', justifyContent:'center'}}>
              <Text style={{textAlign:'center', fontSize:22}}>Welcome to the CSWWU Mentors!</Text>
              <View style={{height: 25}} />
              <Text style={{textAlign:'center', fontSize:22}}>Admins are verifying your profile, check back later to be connected with your mentor/mentee.</Text>
          </View>
        </View>
        ] : [
          <View style={{width:windowWidth, height:100, flexDirection:'row', alignItems:'center', backgroundColor:'white'}}>
            <View style={{width:80, alignItems:'center', justifyContent:'center'}}>
              <Image style={{width:60, height:60}} source={require('./assets/avatar.png')} />
            </View>
            <View style={{width: mainConversationWidth, flexDirection:'column'}}>
              <View style={{flexDirection:'row'}}>
                <Text style={{fontSize:20}}>John Smith</Text>
                <View style={{width:5}} />
                <View style={styles.MentorBox}>
                  <Text style={styles.MentorTag}>Mentor</Text>
                </View>
              </View>
              <View style={{height:4}} />
              <View>
                <Text>This is a previous of our conversation. I'll...</Text>
              </View>
            </View>
            <View style={{width:40, alignItems:'center', justifyContent:'center'}}>
              <Image style={{width:24, height:24}} source={require('./assets/right-message-chevron.png')} />
            </View>
          </View>
        ]}
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
