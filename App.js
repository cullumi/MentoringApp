import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, AsyncStorage, StyleSheet, Text, Image, Button, View, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import LinkedInModal from 'react-native-linkedin';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { GiftedChat } from "react-native-gifted-chat";
import { color, debug } from 'react-native-reanimated';
import { Colors } from 'react-native/Libraries/NewAppScreen';

// Needs to be implemented:
// import Storage from './localstorage';

// navigation controllers
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// measurements and styles

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const windowHeight6 = windowHeight / 6;
const mainWidth = windowWidth - 60;
const mainConversationWidth = windowWidth - 130;
const mainTitleWidth = windowWidth - 90;

const colors = {
  vikingBlue: '#003F87',
  white: '#fff',
  lightGrey: '#f6f6f6',
  grey: 'gray',
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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

// Get necessary data for HomeScreen.

// accountType: 0 - not verified, please wait until admins pair you with mentor/mentees
//              1 - verified, check for conversations to display
// const accountType = Storage.getItem('accountType');
const accountID = 1;
const accountType = 0; 

const accounts = {
  0:{
    name:"Abbi",
    type:"Mentor",
    connections:[2, 3,],
  },
  1:{
    name:"Baltar",
    type:"Mentee",
    connections:[2, 3, 4, 5,],
  },
  2:{
    name:"Hero",
    type:"Mentor",
    connections:[0, 1, 3,],
  },
  3:{
    name:"Helgen",
    type:"Mentee",
    connections:[0, 1, 2,],
  },
  4:{
    name:"Tiny Box Tim",
    type:"Mentor",
    connections:[1,5,],
  },
  5:{
    name:"Numbah Five",
    type:"Mentee",
    connections:[1,4,],
  },
};

const meetings = {
  "0-1-11/19/2020":{
    mentorID:0,
    menteeID:1,
    date:"11.19.2020",
    time:"6:00pm",
  },
  "0-1-11/12/2020":{
    mentorID:0,
    menteeID:1,
    date:"11.19.2020",
    time:"6:00pm",
  },
};

const newMeetings = ["0-1-11/19/2020", "0-1-11/12/2020"];
const oldMeetings = ["0-1-11/19/2020"];



// HOME STACK

function HomeStack() {
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
            activeTintColor: colors.vikingBlue,
            inactiveTintColor: 'gray',
        }}
    >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Meetings" component={MeetingsScreen} />
    </Tab.Navigator>
  );
}

const titleBar = (title, navFunction) => {
  return (
    <View>
      <View style={{height:25, backgroundColor: colors.vikingBlue}}></View>
      <View style={{height:30, backgroundColor: colors.white}}></View>
      <View style={{flexDirection:'row-reverse', backgroundColor: colors.white, alignItems:'center'}}>
        <View style={{width:15}}></View>
        <TouchableOpacity onPress={navFunction} activeOpacity={0.5}>
          <Image style={{width:30, height:30}} source={require('./assets/help.png')} />
        </TouchableOpacity>
        <View style={{width:mainTitleWidth,textAlign:'center',alignItems:'center'}}>
          <Text style={{fontSize:22}}>{title}</Text>
        </View>
      </View>
      <View style={{height:30, backgroundColor: colors.white}}></View>
    </View>
  );
};


// HOME SCREEN

// Note: Separated unapprovedAccount and approvedAccount code into their own methods, but just because I could.
const HomeScreen = ({ navigation }) => {
  return (
    <View style={{flex: 1, flexDirection: 'column'}}>
      { titleBar("Home", () => navigation.navigate('HelpModal')) }
      { accountType == 1 ? [unapprovedAccount()] : [approvedHome(accountID)] }
    </View>
  );
};

const unapprovedAccount = () => {
  return (
  <View style={{height:50, width:windowWidth}} />,
  <View style={{width: windowWidth, flexDirection: 'row-reverse', alignItems:'center'}}>
    <View style={{width: 25}} />
    <View style={{width: mainWidth, alignItems:'center', justifyContent:'center'}}>
      <View style={{height: 50}} />
      <Text style={{textAlign:'center', fontSize:22}}>Welcome to the CSWWU Mentors!</Text>
      <View style={{height: 25}} />
      <Text style={{textAlign:'center', fontSize:22}}>Admins are verifying your profile, check back later to be connected with your mentor/mentee.</Text>
    </View>
  </View>
  );
};

const approvedHome = (accountID) => {  
  return (
    <View>
      { accounts[accountID].connections.map( (id) => { 
        return( 
          <View>
            <View style={{height:5}}></View>
            {connectionItem(id)}
          </View> 
        );
      })}
    </View>
  );
};

const connectionItem = (connectionID) => {

  return (
    <View style={{width:windowWidth, height:110, flexDirection:'row', alignItems:'center', backgroundColor: colors.lightGrey}} >
      <View style={{width:80, alignItems:'center', justifyContent:'center'}}>
        <Image style={{width:60, height:60}} source={require('./assets/avatar.png')} />
        <View style={{height:5}} />
        <View style={styles.MentorBox}>
          <Text style={styles.MentorTag}>{ accounts[connectionID].type } </Text>
        </View>
      </View>
      <View style={{width: mainConversationWidth, flexDirection:'column'}}>
      <View style={{flexDirection:'row'}}>
        <Text style={{fontSize:20}}>John Smith</Text>
      </View>
        <View style={{height:4}} />
        <View>
          <Text></Text>
        </View>
      </View>
      {/* <View style={{width:40, alignItems:'center', justifyContent:'center'}}>
        <IonIcon type='Ionicons' name='ios-arrow-dropright' size={30} color='#000000' onPress={() => navigation.navigate('Messaging')} />
      </View> */}
    </View>
  );
};



// MEETING SCREENS

const MeetingsScreen = ({ navigation }) => {
  return (
    <View style={{flex: 1, flexDirection: 'column'}}>
      { titleBar("Meetings", () => navigation.navigate('HelpModal')) }
      { accountType == 1 ? [unapprovedAccount()] : [approvedMeetings(accountID)] }
    </View>
  );
};

const approvedMeetings = () => {
  return (
    <View>
      <View style={{alignItems:'center',justifyContent:'center'}}>
        { upcomingMeetings(accountID) }
        { pastMeetings(accountID) }
      </View>
    </View>
  );
}

const upcomingMeetings = (accountID) => {
  return (
    <View style={{alignItems:'center',justifyContent:'center'}}>
      <View style={{height:30}}></View>
      <Text style={{fontSize:25}}>Upcoming Meetings</Text>
      <View style={{height:30}}></View>
      { newMeetings.length === 0 
      ? [ <Text style={{fontSize:20}}>No meetings scheduled.</Text> ] 
      : [ newMeetings.map( (id) => {
          return (
            <View>
              <View style={{height:5}}></View>
              { meetingItem(accountID, id) }
            </View>
          ); 
        })]}
    </View>
  );
};

const pastMeetings = (accountID) => {
  return (
    <View style={{alignItems:'center',justifyContent:'center'}}>
      <View style={{height:30}}></View>
      <Text style={{fontSize:25}}>Past Meetings</Text>
      <View style={{height:30}}></View>
      { oldMeetings.length === 0
      ? [ <Text style={{fontSize:20}}>No meetings been held yet.</Text> ] 
      : [ oldMeetings.map( (id) => meetingItem(accountID, id) ) ] }
    </View>
  );
};

const meetingItem = (accountID, meetingID) => {

  const meeting = meetings[meetingID];
  const currUser = accounts[accountID];
  const otherUser = accounts[meeting.mentorID === accountID ? meeting.menteeID : meeting.mentorID];
  
  return (
    <View style={{width:windowWidth, height:110, flexDirection:'row', alignItems:'center', backgroundColor: colors.lightGrey}} >
      <View style={{width:80, alignItems:'center', justifyContent:'center'}}>
        <Image style={{width:60, height:60}} source={require('./assets/avatar.png')} />
        <View style={{height:5}} />
        <View style={styles.MentorBox}>
          <Text style={styles.MentorTag}>{ otherUser.type }</Text>
        </View>
      </View>
      <View style={{width: mainConversationWidth, flexDirection:'column'}}>
        <View style={{flexDirection:'row'}}>
          <View style={{flexDirection:'column'}}>
            <Text style={{fontSize:20}}>{ meeting.date }</Text>
            <Text style={{fontSize:20}}>{ meeting.time }</Text>
          </View>
        </View>
        <View>
          <Text></Text>
        </View>
      </View>
      <View style={{height:25, backgroundColor: colors.white}}></View>
    </View>
  );
};

const ViewDebriefScreen = () => {
  return <Text></Text>;
};

const SubmitDebriefScreen = () => {
  return <Text></Text>;
};

const ProposeMeetingScreen = () => {
  return <Text></Text>;
};



// MESSAGING SCREEN

const initialMessages = [
        {
          _id: 1,
          text: "Hello, here's a photo.",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Adam Bullard',
            avatar: 'http://adambullard.com/images/smiling.JPG',
          },
          image: 'https://i.pinimg.com/originals/5b/b4/8b/5bb48b07fa6e3840bb3afa2bc821b882.jpg'
        }
        
  ];

const MessagingScreen = ({ navigation }) => {

  const [messages, setMessages] = useState(initialMessages);
  
  return (
    <View style={{flex: 1, flexDirection: 'column'}}>
      <View style={{height:22, backgroundColor: colors.vikingBlue}}></View>
      <View style={{height:30, backgroundColor: colors.white}}></View>
      <View style={{flexDirection:'row-reverse', backgroundColor: colors.white}}>
        <View style={{width:25}} />
        <IonIcon type='Ionicons' name='ios-document' size={30} color='#000000' onPress={() => navigation.navigate('ProposeMeeting')} />
        <View style={{width:mainTitleWidth,textAlign:'center',alignItems:'center'}}>
          <Text style={{fontSize:22}}>John Smith</Text>
        </View>
        <IonIcon type='Ionicons' name='ios-close' size={30} color='#000000' onPress={() => navigation.navigate('Main')} />
      </View>
      <View style={{height:30, backgroundColor: colors.white}}></View>
      <GiftedChat messages={messages} />
    </View>
  );
};

const HelpScreen = ({ navigation }) => {
  return (
    <View>
      { titleBar("Help Screen", () => navigation.goBack()) }
      <Button color={colors.vikingBlue} onPress={() => navigation.goBack()} title="Dismiss" />
    </View>
  );
};



// LOGIN AND PRIVACY SCREENS

// A LoginScreen class-- used to help with some state setting problems-- "refreshing" is now within this class' scope.
// Note: the Stack Navigator automatically sets the "navigation" prop, which can be accessed via this.props.navigation.
// The original issue I stumbled across was an attempt to pass a "Type" (a clear remnant of the TypeScript source).
class LoginScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      refreshing : false
    };
  }
  
  // Note: passing in handleLogin with "this" inside of a "big-arrow function" ensures handleLogin can make use of the LoginScreen state props.  Mind the this!
  render () {
    if (this.state.id != undefined) {
      this.props.navigation.navigate('Privacy');
    }
    return  <View style={styles.container}>
              <LinkedInModal
                clientID="86bzo41s6bc4am"
                clientSecret="O2U1ANijJnQG2E3s"
                redirectUri="https://cs.wwu.edu/"
                onSuccess={data => {
                  this.handleLogin(data);
                  if (this.state.id != undefined) {
                    this.props.navigation.navigate('Privacy');
                  }
                }}
              />
            </View>
  }

  // handles fetching of login information; Note: payload contains profile information upon a successful login.
  async handleLogin(data) {
    const { access_token, authentication_code } = data;
  
    if (!authentication_code) { 
      this.setState({ refreshing: true });
      const response = await fetch('https://api.linkedin.com/v2/me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + access_token,
        }
      });
      const payload = await response.json();
      this.setState({ ...payload, refreshing: false });
      console.log(JSON.parse(JSON.stringify(payload)));
    } 
    else {
      console.log("Authentication Code Received: " + authentication_code);
    }
  }
}

// The PrivacyScreen function -- simply navigates to Main right after coming from Login, for the time being.
const PrivacyScreen = ({navigation}) => {
  navigation.navigate('Main')
  return (null);
};



// APP CONTAINER

// Main class for app. Responsible for rendering app container.
export default class AppContainer extends React.Component {

  // Main rendering function. Always begins on the LoginScreen.
  // Note: The Login and Privacy screens have been added to the Stack Navigator.
  //        I found that React Navigation creates problems when trying to pass along state.
  render() {
    return (
        <NavigationContainer>
          <Stack.Navigator headerMode='none'>
            <Stack.Screen name='Login' component={LoginScreen} />
            <Stack.Screen name='Privacy' component={PrivacyScreen} />
            <Stack.Screen name='Main' component={HomeStack} />
            <Stack.Screen name='HelpModal' component={HelpScreen} />
            {/* <Stack.Screen name='Messaging' component={MessagingScreen} /> */}
            <Stack.Screen name='ProposeMeeting' component={ProposeMeetingScreen} />
          </Stack.Navigator>
        </NavigationContainer>
    );
  }

};
