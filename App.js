import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, AsyncStorage, StyleSheet, Text, Image, Button, View, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import LinkedInModal from 'react-native-linkedin';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IonIcon from 'react-native-vector-icons/Ionicons';

// Needs to be implemented:
// import Storage from './localstorage';

// navigation controllers
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// measurements and styles

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const windowHeight6 = windowHeight / 6;
const mainWidth = windowWidth - 50;
const mainConversationWidth = windowWidth - 130;
const mainTitleWidth = windowWidth - 90;

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
        <View style={{height:22, backgroundColor:'#003F87'}}></View>
        <View style={{height:30, backgroundColor:'#fff'}}></View>
        <View style={{flexDirection:'row-reverse', backgroundColor:'#fff', alignItems:'center'}}>
          <View style={{width:15}}></View>
          <TouchableOpacity onPress={() => navigation.navigate('HelpModal')} activeOpacity={0.5}>
            <Image style={{width:30, height:30}} source={require('./assets/help.png')} />
          </TouchableOpacity>
          <View style={{width:mainTitleWidth,textAlign:'center',alignItems:'center'}}>
            <Text style={{fontSize:22}}>Home</Text>
          </View>
        </View>
        <View style={{height:30, backgroundColor:'#fff'}}></View>
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
          <View style={{width:windowWidth, height:110, flexDirection:'row', alignItems:'center', backgroundColor:'#f6f6f6'}}>
            <View style={{width:80, alignItems:'center', justifyContent:'center'}}>
              <Image style={{width:60, height:60}} source={require('./assets/avatar.png')} />
              <View style={{height:5}} />
                <View style={styles.MentorBox}>
                  <Text style={styles.MentorTag}>Mentor</Text>
                </View>
            </View>
            <View style={{width: mainConversationWidth, flexDirection:'column'}}>
              <View style={{flexDirection:'row'}}>
                <Text style={{fontSize:20}}>John Smith</Text>
              </View>
              <View style={{height:4}} />
              <View>
                <Text>This is a preview of our conversation...</Text>
              </View>
            </View>
            <View style={{width:40, alignItems:'center', justifyContent:'center'}}>
              <IonIcon type='Ionicons' name='ios-arrow-dropright' size={30} color='#000000' onPress={() => alert('This will eventually open a conversation!')} />
            </View>
          </View>
        ]}
      </View>
  );
};

const MeetingsScreen = ({ navigation }) => {
  return (
    <View style={{flex: 1, flexDirection: 'column'}}>
      <View style={{height:22, backgroundColor:'#003F87'}}></View>
        <View style={{height:30, backgroundColor:'#fff'}}></View>
        <View style={{flexDirection:'row-reverse', backgroundColor:'#fff', alignItems:'center'}}>
          <View style={{width:15}}></View>
          <TouchableOpacity onPress={() => navigation.navigate('HelpModal')} activeOpacity={0.5}>
            <Image style={{width:30, height:30}} source={require('./assets/help.png')} />
          </TouchableOpacity>
          <View style={{width:mainTitleWidth,textAlign:'center',alignItems:'center'}}>
            <Text style={{fontSize:22}}>Meetings</Text>
          </View>
        </View>
        <View style={{height:30, backgroundColor:'#fff'}}></View>
    </View>
  );
};

const ViewDebriefScreen = () => {
  return <Text></Text>;
};

const MessagingScreen = () => {
  return <Text></Text>;
};

const HelpScreen = ({ navigation }) => {
  return (
    <View>
      <Text>Help Screen</Text>
      <Button onPress={() => navigation.goBack()} title="Dismiss" />
    </View>
  );
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

function HomeStackLoggedIn() {
  return (
    <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;

                  if (route.name === 'Home') {
                    iconName = focused
                      ? 'ios-home'
                      : 'ios-home';
                  } else if (route.name === 'Meetings') {
                    iconName = focused ? 'ios-list-box' : 'ios-list';
                  }

                  return <IonIcon name={iconName} size={size} color={color} />;
                }
              })}
              tabBarOptions={{
                activeTintColor: '#003F87',
                inactiveTintColor: 'gray',
              }}
            >
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Meetings" component={MeetingsScreen} />
      </Tab.Navigator>
  );
}

const LoggedOutStack = createStackNavigator();

function HomeStackLoggedOut() {
  return (
    <LoggedOutStack.Navigator>
      <LoggedOutStack.Screen name="Login" component={LoginScreen} />
      <LoggedOutStack.Screen name="Privacy" component={PrivacyScreen} />
    </LoggedOutStack.Navigator>
  );
}

const loggedIn = true;

// Main class for app. Responsible for rendering app container.
export default class AppContainer extends React.Component {
  // Main rendering function. Detects whether user is signed in, then brings them to Home or Login.
  render() {
    return (
        <NavigationContainer>
          <Stack.Navigator mode='modal' headerMode='none'>
            <Stack.Screen name='Main' component={loggedIn ? HomeStackLoggedIn : HomeStackLoggedOut} />
            <Stack.Screen name='HelpModal' component={HelpScreen} />
          </Stack.Navigator>
        </NavigationContainer>
    );
  }

};
