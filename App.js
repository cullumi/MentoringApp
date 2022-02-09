

import 'react-native-gesture-handler';
import React, { useState, Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {PushNotificationIOS} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { color, debug } from 'react-native-reanimated';
import { AppRegistry } from 'react-native-web';
// import { Colors } from 'react-native/Libraries/NewAppScreen';
// import Button from 'react-native-button';
// import { SystemMessage } from 'react-native-gifted-chat';



// Basically Global Variables and Constants
// accountType: 0 - not verified, please wait until admins pair you with mentor/mentees
//              1 - verified, check for conversations to display
// const accountType = Storage.getItem('accountType');
const accountID = 1;
const accountType = 0;
const url = "http://mshipapp2.loca.lt";
var curUser;
const globals = {
  accountID: 1,
  accountType: 0,
  url: "http://mshipapp2.loca.lt",
}


// Scripts

// 1. MEASUREMENTS AND STYLES ARE LOCATED IN THE Styles.js FILE
import {colors} from './AppScripts/Styles.js';
// import * as ScreenComponents from './AppScripts/ScreenComponents.js';
// import * as Helper from './AppScripts/Helper.js';
// import * as API from './AppScripts/';
import HomeScreen from './AppScripts/HomeScreen.js';
import ContactInfoScreen from './AppScripts/ContactInfoScreen.js';
import MeetingsScreen from './AppScripts/MeetingsScreen.js';
import WriteSummaryScreen from './AppScripts/WriteSummaryScreen.js';
import ProposeMeetingScreen from './AppScripts/ProposeMeetingScreen.js';
import TopicsScreen from './AppScripts/TopicsScreen.js';
import HelpScreen from './AppScripts/HelpScreen.js';
import SplashScreen from './AppScripts/SplashScreen.js';
import LoginScreen from './AppScripts/LoginScreen.js';
import PrivacyScreen from './AppScripts/PrivacyScreen.js';
import SettingsScreen from './AppScripts/SettingsScreen.js';
// import { registerForPushNotifications } from './AppScripts/PushNotifs.js';
import * as Globals from './AppScripts/globals.js';

// Needs to be implemented:
// import Storage from './localstorage';


// Navigation controllers
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


// || CodeSplitting Plan ||
//
// 1) Move all non-Stack and non-Tab classes and methods into separate files. *DONE*
//    - This file should only contain what is needed for navigation or for global access.
// 2) Finish Refactoring all of those classes and methods using "import".  *NOT STARTED*
// 3) Using this New Refactored code to look for code w/ low readability.
//    - Basically, can you understand what this code is doing at a glance?
//
// || Things to Think About ||
//
// 1) We're currently writing code that could be used and maintained by the CS Department for Years to Come
//    - As such, we should be finding every opportuntity to make that process easy and not a pain in the ass.
// 2) It should be easy enough to not couple our Screens w/ one another, since React Navigation has us covered.
// 3) We should really be splitting large methods into smaller, readable and reusable portions whenever possible.
//    - This is generally good practice even if code is only used once.
//    - The only time to not do this is for small tasks that are incredibly specific.
//    - Examples of when to always do it:
//        + API GET and POST methods
//        + Commonly Used UI Structures
//        + Common Parsing or Calculations (Such as with Dates)

// PushNotificationIOS.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

const initialParams = Globals.globalParams();

// HOME STACK
function HomeStack() {

  return (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown:false,
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                    iconName = focused
                    ? 'ios-home'
                    : 'ios-home';
                } else if (route.name === 'Meetings') {
                    iconName = focused ? 'ios-calendar' : 'ios-calendar';
                } else if (route.name === 'Topics') {
                    iconName = focused ? 'ios-bulb' : 'ios-bulb';
                }

                return <IonIcon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTinColor: colors.vikingBlue,
            tabBarInactiveTinColor: 'gray',
            tabBarShowLabel: false,
            tabBarStyle: [
              {
                display: 'flex',
              },
              null
            ],
        })}
        // tabBarOptions={{
        //     activeTintColor: colors.vikingBlue,
        //     inactiveTintColor: 'gray',
        //     showLabel: false
        // }}
    >
        <Tab.Screen name="Home" component={HomeScreen} initialParams={initialParams}/>
        <Tab.Screen name="Meetings" component={MeetingsScreen} initialParams={initialParams}/>
        <Tab.Screen name="Topics" component={TopicsScreen} initialParams={initialParams}/>
    </Tab.Navigator>
  );
}

function emergencyLogout() {
  AsyncStorage.clear();
}

// APP CONTAINER
// Main class for app. Responsible for rendering app container.
export default class AppContainer extends React.Component {

  // componentDidMount() {
  //   registerForPushNotifications();
  // }

  // Main rendering function. Always begins on the SplashScreen.
  // Note: The Login and Privacy screens have been added to the Stack Navigator.
  //        I found that React Navigation creates problems when trying to pass along state.
  render() {
    emergencyLogout();


    // emergencyLogout();
    // console.ignoredYellowBox
    // LogBox.ignoreLogs(['Warning: Each', 'Warning: Possible']);
    //{/*headerMode='none'*/}

    return (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown:false}} initialRouteName='Splash'>
            <Stack.Screen name='Splash' component={SplashScreen} initialParams={initialParams}/>
            <Stack.Screen name='Login' component={LoginScreen} initialParams={initialParams}/>
            <Stack.Screen name='Privacy' component={PrivacyScreen} initialParams={initialParams}/>
            <Stack.Screen name='Main' component={HomeStack} initialParams={initialParams}/>
            <Stack.Screen name='SettingsModal' component={SettingsScreen} initialParams={initialParams}/>
            <Stack.Screen name='HelpModal' component={HelpScreen} initialParams={initialParams}/>
            <Stack.Screen name='ProposeMeeting' component={ProposeMeetingScreen} initialParams={initialParams}/>
            <Stack.Screen name='WriteSummary' component={WriteSummaryScreen} initialParams={initialParams}/>
            <Stack.Screen name='ContactInfo' component={ContactInfoScreen} initialParams={initialParams}/>
          </Stack.Navigator>
        </NavigationContainer>
    );
  }
};

AppRegistry.registerComponent(AppContainer);
