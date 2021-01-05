import 'react-native-gesture-handler';
import React, { useState, Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Animated, Linking, TouchableOpacity, AsyncStorage, StyleSheet, Text, Image, SafeAreaView, ScrollView, View, ActivityIndicator, StatusBar, Dimensions, Alert, TextInput } from 'react-native';
import LinkedInModal from 'react-native-linkedin';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { color, debug } from 'react-native-reanimated';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Button from 'react-native-button';
import Tooltip from 'react-native-walkthrough-tooltip';

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
  red: '#e74c3c',
  green: '#2ecc71',
  yellow: '#f1c40f'
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center'
  },

  scrollView: {
    color:'#000'
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
  },

  basePrivacyText: {
    fontSize: 12,
    textAlign:"center"
  },

  basePrimaryTextBolded: {
    fontSize: 12,
    textAlign:"center",
    fontWeight: "bold"
  },

  titlePrimaryText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign:"center"
  },

  headerPrimaryText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign:"center"
  },

  headerSupportPrimaryText: {
    fontSize: 17,
    color: "#95a5a6",
    textAlign: "center"
  },

  meetingsTitle: {
    fontSize:30,
    alignSelf:'flex-start'
  },

  meetingsPrimaryNone: {
    fontSize:16,
    textAlign:"center"
  },

  meetingsGroup: {
    paddingTop: 25,
    paddingLeft: 15,
    paddingBottom:25,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  meeting: {
    marginRight:15,
    marginLeft:15,
    marginBottom:15,
    borderRadius:50
  },

  meetingInfo: {
    backgroundColor:"white",
    flexDirection:"column",
    padding:15
  },

  meetingAvatar: {
    width:60,
    height:60,
    marginRight:10,
    backgroundColor:"#ddd",
    borderRadius:100
  },

  meetingMainRow: {
    flexDirection:"row",
    alignItems:"center"
  },

  meetingTitleText: {
    fontSize:20
  },

  meetingDateText: {
    fontSize:14
  },

  summaryInputBox: {
    marginLeft:15,
    marginRight: 15,
    marginTop: 15,
    marginBottom:15,
    paddingTop:5,
    paddingLeft:10,
    paddingRight:10,
    backgroundColor:'#fff'
  },

  summaryInput: {
    height:200,
    backgroundColor:'#fff'
  },

  summaryButton: {
    padding: 15,
    backgroundColor: colors.vikingBlue,
    alignItems:'center',
    marginLeft:15,
    marginRight:15,
    marginBottom:45,
    marginBottom:15
  },

  summaryButtonText: {
    textAlign: 'center',
    fontSize:16,
    color: '#fff'
  },

  summaryTitle: {
    fontSize:16,
    textAlign:'center',
    alignItems:'center',
    marginTop:15
  },

  savedNotification: {
    textAlign:'center',
    width:'100%',
    height:18,
    alignContent:'center',
    justifyContent:'center',
    color:'#000',
    fontSize:18,
    marginBottom:15
  },

  helpContainer: {
    justifyContent:'center',
    alignItems:'center',
    marginLeft:15,
    marginRight:15
  },

  helpTitle: {
    fontSize:20
  },

  helpPara: {
    textAlign:'center'
  },

  helpPending: {
    fontWeight: 'bold',
    color: '#003F87',
    textAlign:'center'
  },

  helpGreen: {
    fontWeight: 'bold',
    color: colors.green,
    textAlign:'center'
  }

});

// Get necessary data for HomeScreen.

// accountType: 0 - not verified, please wait until admins pair you with mentor/mentees
//              1 - verified, check for conversations to display
// const accountType = Storage.getItem('accountType');
const accountID = 1;
const accountType = 0;
const url = "http://mshipapp.loca.lt";
var curUser;
// var mentors
// var mentees


const testAccounts = {
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



// API GET and POST Methods

// Gets all pairs containing the given user as a mentor, then gets a list of mentees using those pairs.
async function getMenteesOf (userID) {

  console.log("Getting Mentees...")

  const pairs = await getPairsOf('mentee', userID);
  const mentees = [];
  for (var i = 0; i < pairs.length; i++) {
    mentees.push(getUserByID(pairs[i].menteeID));
  }

  return mentees;
}

// Gets all pairs containing the given user as a mentee, then gets a list of mentors using those pairs.
async function getMentorsOf (userID) {

  console.log("Getting Mentors...");

  const pairs = await getPairsOf('mentor', userID);
  const mentors = [];
  for (var i = 0; i < pairs.length; i++) {
    mentors.push(getUserByID(pairs[i].mentorID));
  }

  return mentors;
}

async function getPairsOf(type, userID) {
  const pairsres = await fetch(url + '/pair/' + type + '/' + userID, {
    method: 'GET'
  });
  console.log("Creating json payload");
  const pairsPayload = await pairsres.json();

  console.log("Attempting to print payload");
  console.log(pairsPayload);

  const recordSets = pairsPayload["recordsets"];
  var pairs = [];

  for (var i = 0; i < recordSets.length; i++) {
    const recordSet = recordSets[i];
    const pair = {
      id: recordSet["Id"],
      mentorID: recordSet["MentorID"],
      menteeID: recordSet["MenteeID"],
      created: recordSet["Created"],
      lastUpdate: recordSet["LastUpdate"],
      privacyAccepted: recordSet["PrivacyAccepted"]
    }
    pairs.push(pair);
  }

  return pairs;
}

// Gets the Current User via the ensureUserExists method.
async function getCurrentUser () {
  const userPayload = await ensureUserExists();
  return createLocalUser(userPayload);
}

// Gets a user based on a certain user id.
async function getUserByID(id) {
  const userPayload = await getUserByID(id);
  return createLocalUser(userPayload);
}

// Creates a javascript object out of a user payload for use elsewhere in the React Native app.
function createLocalUser(userPayload) {
  const recordSet = userPayload["recordset"][0];
  return {
    id: recordSet["Id"],
    email: recordSet["Email"],
    firstName: recordSet["FirstName"],
    lastName: recordSet["LastName"],
    avatar: recordSet["Avatar"],
    created: recordSet["Created"],
    lastUpdate: recordSet["LastUpdate"],
    privacyAccepted: recordSet["PrivacyAccepted"],
    approved: recordSet["Approved"]
  };
}

// Probably temporary, but this effectively accounts for when the user was created offline, or for when the API is offline.
async function ensureUserExists () {
  // try {
  const email = await AsyncStorage.getItem("Email");
  const first = await AsyncStorage.getItem('FirstName');
  const last = await AsyncStorage.getItem('LastName');
  const pic = await AsyncStorage.getItem('Avatar');
  // } catch (error) {
  //   console.log(error);
  // }

  console.log("Email: " + email);
  let userPayload = await getUserPayloadByEmail(email);

  // check if this user needs to be added to DB.
  while (userPayload.rowsAffected == 0) {
    await postNewUser(email, first, last, pic);
    userPayload = await getUserPayloadByEmail(email);
  }

  const payload = userPayload;
  return payload;
}

async function getUserPayloadByEmail(email) {
  const userres = await fetch(url + '/user/email/' + email, {
    method: 'GET'
  });
  const userPayload = await userres.json();
  return userPayload;
}

async function getUserPayloadByID(id) {
  const userres = await fetch(url + '/user/id/' + id, {
    method: 'GET'
  });
  const userPayload = await userres.json();
  return userPayload;
}

// create user via POST
async function postNewUser(email, first, last, pic) {

  console.log("Post new user...");

  const postres = fetch(url + '/create-user', {
    method: 'POST',
    body: JSON.stringify({
      Email: email,
      FirstName: first,
      LastName: last,
      Avatar: pic,
      PrivacyAccepted: 0
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  })
  /*.then(response => response.json())
  .then(json => console.log(json))*/
  .catch((error) => {
    console.error(error);
  });
}

async function updatePrivacy(email, privacyAccepted) {

  const postres = fetch (url + '/update-privacy', {
    method: 'POST',
    body: JSON.stringify({
      Email: email,
      PrivacyAccepted: privacyAccepted
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .catch((error) => {
    console.error(error);
  });

}



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
                    iconName = focused ? 'ios-calendar' : 'ios-calendar';
                } else if (route.name === 'Topics') {
                    iconName = focused ? 'ios-bulb' : 'ios-bulb';
                }

                return <IonIcon name={iconName} size={size} color={color} />;
            }
        })}
        tabBarOptions={{
            activeTintColor: colors.vikingBlue,
            inactiveTintColor: 'gray',
            showLabel: false
        }}
    >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Meetings" component={MeetingsScreen} />
        <Tab.Screen name="Topics" component={TopicsScreen} />
    </Tab.Navigator>
  );
}

const titleBar = (title, navFunction) => {
  return (
    <View key={title}>
      <View style={{height:25, backgroundColor: colors.vikingBlue}}></View>
      <View style={{height:30, backgroundColor: colors.white}}></View>
      <View style={{flexDirection:'row-reverse', backgroundColor: colors.white, alignItems:'center'}}>
        <View style={{width:15}}></View>
        <TouchableOpacity onPress={navFunction} activeOpacity={0.5}>
          <IonIcon name="ios-settings" size={30} color={colors.vikingBlue} />
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

class HomeScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      shouldUpdate: true,
      mentors: [],
      mentees: []
    };
  }

  async setPairs() {

    var newMentors = [];
    var newMentees = [];
    var doSetAsyncStorage = false;

    try {
      newMentors = await getMentorsOf(curUser);
      newMentees = await getMenteesOf(curUser);
      doSetAsyncStorage = true;
    } catch (error) {
      console.log(error);
      try {
        var tempMentors = await AsyncStorage.getItem('Mentors');
        var tempMentees = await AsyncStorage.getItem('Mentees');

        if (tempMentors != null && Array.isArray(tempMentors)) {
          newMentors = tempMentors;
        }
        if (tempMentees != null && Array.isArray(tempMentees)) {
          newMentees = tempMentees;
        }
      } catch (error) {
        console.log(error);
      }
    }

    // Save mentor/mentee info from the database into local storage, for when you're offline.
    if (doSetAsyncStorage) {
      try {
        await AsyncStorage.setItem('Mentors', newMentors);
        await AsyncStorage.setItem('Mentees', newMentees);
      } catch (error) {
        console.log(error);
      }
    }

    this.setState({shouldUpdate: false, mentors: newMentors, mentees: newMentees});
  }

  unapprovedAccount() {
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

  approvedHome() { // removed accountID from approvedHome() parameters
    if (this.state.shouldUpdate) {
      this.setPairs();
    }

    return (
      <View>
        <Text>Mentors</Text>
        {
          this.state.mentors.map( (mentor) => {
            return this.pairItem(mentor, "Mentor");
          })
        }
        <Text>Mentees</Text>
        {
          this.state.mentees.map( (mentee) => {
            return this.pairItem(mentee, "Mentee");
          })
        }
      </View>
    );
  };

  pairItem(otherUser, otherType) {
    return (
      <View>
        <View style = {{height:5}}></View>
        <View key={otherUser.id.toString()} style={{width:windowWidth, height:110, flexDirection:'row', alignItems:'center', backgroundColor: colors.lightGrey}} >
          <View style={{width:80, alignItems:'center', justifyContent:'center'}}>
            {/* <Image style={{width:60, height:60}} source={require('./assets/avatar.png')} /> */}
            <Image style={{width:60, height:60}} source={otherUser.avatar} />
            <View style={{height:5}} />
            <View style={styles.MentorBox}>
              <Text style={styles.MentorTag}>{ otherType } </Text>
            </View>
          </View>
          <View style={{width: mainConversationWidth, flexDirection:'column'}}>
          <View style={{flexDirection:'row'}}>
            <Text style={{fontSize:20}}>{otherUser.firstName + " " + otherUser.lastName}</Text>
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
      </View>
    );
  };

  render() {
    return (
    <View style={{flex: 1, flexDirection: 'column'}}>
      { titleBar("Home", () => this.props.navigation.navigate('SettingsModal')) }
      { accountType == 1 ? [this.unapprovedAccount()] : [this.approvedHome()] }
    </View>
    );
  }
}

function parseDateText(date) {
  
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];      
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  const dateText = months[date.getMonth()] + 
                        " " + date.getDate() + 
                        ", " + date.getFullYear() + 
                        " " + hours + ":" + minutes + 
                        " " + ampm;
  return dateText;
}

async function getAppointments(type) {

  console.log("Getting Appointments...")

  var meetings = [];
  var pairs = [];
  var user = JSON.parse(await AsyncStorage.getItem('User'));

  const appres = await fetch(url + '/pair/' + user.id, {
    method: 'GET'
  });
  const appPayload = await appres.json();

  pairs = appPayload['recordset'];

  // Get appointments for each pair the user is a part of.
  for (var i = 0; i < pairs.length; i++) {
    const getres = await fetch(url + '/appointment/' + type + "/" + pairs[i].Id, {
      method: 'GET'
    });
    const getPayload = await getres.json();

    if (getPayload.rowsAffected !== 0) {
      // Add each appointment to the meetings array with other necessary data.
      for (var j = 0; j < getPayload.rowsAffected; j++) {
        var meeting = JSON.parse(JSON.stringify(getPayload['recordset'][j]));
        let date = new Date(meeting.ScheduledAt);
        let cur = new Date();
        //Check if Status needs to be updated due to this meeting happening.
        if (type === 'past' && cur > date && meeting.Status === 'Scheduled') {
          const statusupdateres = await fetch(url + '/update-appointment-status', {
            method: 'POST',
            body: JSON.stringify({
              Id: meeting.Id,
              Status: 'Done'
            }),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          }).catch((error) => {
            console.error(error);
          });
          meeting.Status = 'Done';
        }

        meeting.dateText = parseDateText(date);
        
        meeting.buttonDisabled = false;
        switch(meeting.Status) {
          case 'Pending':
          meeting.meetingStatus = {
            textAlign:"right",
            color: '#003F87'
          }
          break;
          case 'Scheduled':
          meeting.meetingStatus = {
            textAlign:"right",
            color: colors.green
          }
          break;
          case 'Done':
          meeting.meetingStatus = {
            textAlign:"right",
            color: colors.green
          }
          break;
          case 'Completed':
          meeting.meetingStatus = {
            textAlign:"right",
            color: colors.green
          }
          break;
          case 'Cancelled':
          meeting.meetingStatus = {
            textAlign:"right",
            color: '#e74c3c'
          }
          break;
        }
        // Get mentor/mentee avatar, and mark whether this user is the mentor/mentee, and provide title/date text.
        if (pairs[i].MentorId === user.id) {
          meeting.isMentor = true;
          meeting.titleText = "Mentee Meeting";
          const avres = await fetch(url + "/user/id/" + pairs[i].MenteeId, {
            method: 'GET'
          });
          const avPayload = await avres.json();
          meeting.Avatar = avPayload['recordset'][0].Avatar;
          meeting.summaryTitle = "Reflect on your conversation with " + avPayload['recordset'][0].FirstName + ":";
          switch(meeting.Status) {
            case 'Pending':
              meeting.meetingButton = {
                padding: 15,
                backgroundColor: colors.vikingBlue
              }
              meeting.meetingButtonText = {
                textAlign: 'center',
                fontSize:16,
                color: '#fff'
              }
              meeting.buttonText = 'Accept Meeting Time';
              meeting.buttonPress = 'accept';
              break;
            case 'Scheduled':
              meeting.meetingButton = {
                padding: 15,
                backgroundColor: colors.red
              }
              meeting.meetingButtonText = {
                textAlign: 'center',
                fontSize:16,
                color: '#fff'
              }
              meeting.buttonText = 'Cancel Meeting';
              meeting.buttonPress = 'cancel';
              break;
            case 'Done':
            meeting.meetingButton = {
              width: 0,
              height: 0
            }
            meeting.meetingButtonText = {
              textAlign: 'center'
            }
            meeting.buttonText = '';
            meeting.buttonPress = ''; meeting.buttonDisabled = true;
              break;
            case 'Completed':
              meeting.meetingButton = {
                width: 0,
                height: 0
              }
              meeting.meetingButtonText = {
                textAlign: 'center'
              }
              meeting.buttonText = '';
              meeting.buttonPress = ''; meeting.buttonDisabled = true;
              break;
            case 'Cancelled':
              meeting.meetingButton = {
                width: 0,
                height: 0
              }
              meeting.meetingButtonText = {
                textAlign: 'center'
              }
              meeting.buttonText = '';
              meeting.buttonPress = ''; meeting.buttonDisabled = true;
              break;
          }
        } else {
          meeting.isMentor = false;
          meeting.titleText = "Mentor Meeting";
          const avres = await fetch(url + "/user/id/" + pairs[i].MentorId, {
            method: 'GET'
          });
          const avPayload = await avres.json();
          meeting.Avatar = avPayload['recordset'][0].Avatar;
          meeting.summaryTitle = "Reflect on your conversation with " + avPayload['recordset'][0].FirstName + ":";
          switch(meeting.Status) {
            case 'Pending':
              meeting.meetingButton = {
                padding: 15,
                backgroundColor: colors.vikingBlue
              }
              meeting.meetingButtonText = {
                textAlign: 'center',
                fontSize:16,
                color: '#fff'
              }
              meeting.buttonText = 'Waiting for Mentor to Confirm...';
              meeting.buttonPress = ''; meeting.buttonDisabled = true;
              break;
            case 'Scheduled':
              meeting.meetingButton = {
                padding: 15,
                backgroundColor: colors.red
              }
              meeting.meetingButtonText = {
                textAlign: 'center',
                fontSize:16,
                color: '#fff'
              }
              meeting.buttonText = 'Cancel Meeting';
              meeting.buttonPress = 'cancel';
              break;
            case 'Done':
              meeting.meetingButton = {
                padding: 15,
                backgroundColor: colors.yellow
              }
              meeting.meetingButtonText = {
                textAlign: 'center',
                fontSize:16,
                color: '#fff'
              }
              meeting.buttonText = 'Write Summary';
              meeting.buttonPress = 'submitSummary';
              break;
            case 'Completed':
              meeting.meetingButton = {
                padding: 15,
                backgroundColor: colors.green
              }
              meeting.meetingButtonText = {
                textAlign: 'center',
                color:'#fff'
              }
              meeting.buttonText = 'Edit Summary';
              meeting.buttonPress = 'editSummary';
              break;
            case 'Cancelled':
              meeting.meetingButton = {
                width: 0,
                height: 0
              }
              meeting.meetingButtonText = {
                textAlign: 'center'
              }
              meeting.buttonText = '';
              meeting.buttonPress = ''; meeting.buttonDisabled = true;
              break;
          }
        }

        meetings.push(meeting);

      }

    }

  }

  meetings.sort((a,b) => new Date(b.dateText) - new Date(a.dateText));

  //console.log(type + " meetings: " + JSON.stringify(meetings));
  return meetings;
}

// MEETING SCREENS
class MeetingsScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      toolTipVisible: false,
      upcomingMeetings: [],
      pastMeetings: [],
      refreshing: false,
      keyUpdate: 1
    };
  }

  componentDidMount() {
    this.getData();
  };

  componentDidUpdate() {
    if (this.state.refreshing == true) {
      getAppointments('upcoming')
      .then((data) => {
        this.setState({
          upcomingMeetings:data,
          refreshing: false
        })
      });
    }
  };

  getData() {
    getAppointments('past')
    .then((data) => {
      this.setState({
        pastMeetings:data,
        refreshing: false
      })
    });
    getAppointments('upcoming')
    .then((data) => {
      this.setState({
        upcomingMeetings:data,
        refreshing: false
      })
    });
  }

  async acceptMeeting (id) {
    const statusupdateres = await fetch(url + '/update-appointment-status', {
      method: 'POST',
      body: JSON.stringify({
        Id: id,
        Status: 'Scheduled'
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .catch((error) => {
      console.error(error);
    });
    this.setState({refreshing: true});
  }

  acceptMeetingAlert = (id) => {
    // Check if the user is sure they want to accept this meeting time.
    Alert.alert(
      "Accept Meeting",
      "Before accepting, confirm you're available to meet at this time.",
      [
        {
          text: "Nevermind",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Confirm", onPress: () => this.acceptMeeting(id) }
      ],
      { cancelable: false }
    );
  }

  async cancelMeeting (id) {
    const statusupdateres = await fetch(url + '/update-appointment-status', {
      method: 'POST',
      body: JSON.stringify({
        Id: id,
        Status: 'Cancelled'
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  cancelMeetingAlert = (id) => {
    // Check if the user is sure they want to cancel this meeting.
    Alert.alert(
      "Cancel Meeting",
      "Are you sure you want to cancel? The mentee will need to schedule a new meeting.",
      [
        {
          text: "Nevermind",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Confirm", onPress: () => this.cancelMeeting(id) }
      ],
      { cancelable: false }
    );
  }

  handlePress = (type, id, str) => {
    switch(type) {
      case 'accept':
      this.acceptMeetingAlert(id);
      this.setState({refreshing: true});
      break;
      case 'cancel':
      this.cancelMeetingAlert(id);
      this.setState({refreshing: true});
      break;
      case 'submitSummary':
      this.props.navigation.navigate('WriteSummary', { id: id, type: 'submit', summaryTitle: str, onGoBack: () => this.getData() });
      break;
      case 'editSummary':
      this.props.navigation.navigate('WriteSummary', { id: id, type: 'edit', summaryTitle: str, onGoBack: () => this.getData() });
      break;
    }
  }

  printPastMeetings = () => {
    console.log("P: " + JSON.stringify(this.state.pastMeetings));
    if (this.state.pastMeetings[0] !== undefined) {
      return (<View>
        <View style={styles.meetingsGroup}>
          <Text style={styles.meetingsTitle}>Past</Text>
        </View>
        { this.state.pastMeetings.map((m) => {
          return (<View style={styles.meeting}>
            <View style={styles.meetingInfo}>
              <View style={styles.meetingMainRow}>
                <Image style={styles.meetingAvatar} source={{uri: m.Avatar}} />
                <View style={styles.meetingMainInfo}>
                  <Text style={styles.meetingTitleText}>{m.titleText}</Text>
                  <Text style={styles.meetingDateText}>{m.dateText}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={m.meetingStatus}>{m.Status}</Text>
                </View>

              </View>
            </View>
            <Button
              containerStyle={m.meetingButton}
              style={m.meetingButtonText}
              onPress={() => this.handlePress(m.buttonPress, m.Id, m.summaryTitle)}
              disabled={m.buttonDisabled}>
              {m.buttonText}
            </Button>
          </View>);
        })}
      </View>);
    } else {
      return (<View>
      </View>);
    }
  }

  printUpcomingMeetings = () => {
    console.log("U: " + JSON.stringify(this.state.upcomingMeetings));
    if (this.state.upcomingMeetings[0] !== undefined) {
      return (<View>
        <View style={styles.meetingsGroup}>
          <Text style={styles.meetingsTitle}>Upcoming</Text>
          <Tooltip animated={true}
          arrowSize={{width: 16, height: 8}}
          backgroundColor="rgba(0,0,0,0)"
          isVisible={this.state.toolTipVisible}
          placement="left"
          onClose={() => this.setState({toolTipVisible:false})}
          content={<Text>Mentees are responsible for proposing meetings. Schedule meetings by tapping on a specific Mentor on the Home tab!</Text>}>
            <TouchableOpacity
            onPress={() => this.setState({toolTipVisible:true})}>
              <IonIcon style={{paddingRight:15,paddingTop:6}} name="ios-help-circle-outline" size="30" color={colors.gray} />
            </TouchableOpacity>
          </Tooltip>
        </View>
        { this.state.upcomingMeetings.map((m) => {
          return (<View style={styles.meeting}>
            <View style={styles.meetingInfo}>
              <View style={styles.meetingMainRow}>
                <Image style={styles.meetingAvatar} source={m.Avatar} />
                <View style={styles.meetingMainInfo}>
                  <Text style={styles.meetingTitleText}>{m.titleText}</Text>
                  <Text style={styles.meetingDateText}>{m.dateText}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={m.meetingStatus}>{m.Status}</Text>
                </View>

              </View>
            </View>
            <Button
              containerStyle={m.meetingButton}
              style={m.meetingButtonText}
              onPress={() => this.handlePress(m.buttonPress, m.Id)}
              disabled={m.buttonDisabled}>
              {m.buttonText}
            </Button>
          </View>);
        })}
      </View>);
    } else {
      return (<View>
        <View style={styles.meetingsGroup}>
          <Text style={styles.meetingsTitle}>Upcoming</Text>
          <Tooltip animated={true}
          arrowSize={{width: 16, height: 8}}
          backgroundColor="rgba(0,0,0,0)"
          isVisible={this.state.toolTipVisible}
          placement="left"
          onClose={() => this.setState({toolTipVisible:false})}
          content={<Text>Mentees can propose meetings by tapping on a specific mentor on the Home tab!</Text>}>
            <TouchableOpacity
            onPress={() => this.setState({toolTipVisible:true})}>
              <IonIcon style={{paddingRight:15,paddingTop:6}} name="ios-help-circle-outline" size={30} color={colors.gray} />
            </TouchableOpacity>
          </Tooltip>
        </View>
        <Text style={styles.meetingsPrimaryNone}>No scheduled meetings!</Text>
      </View>);
    }

  }

  render () {
    return (<View style={{flex:1}} key={this.state.refreshing}>
    { titleBar("Meetings", () => this.props.navigation.navigate('SettingsModal')) }
    <ScrollView style={styles.scrollView}>
    { this.printUpcomingMeetings() }
    { this.printPastMeetings() }
    </ScrollView>
    </View>);
  }
}

class WriteSummaryScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      storageId: '',
      normalId: -1,
      type: '',
      curSummary: '',
      summaryTitle: '',
      fadeOut: new Animated.Value(0)
    }
  }

  handleBack() {
    this.props.route.params.onGoBack();
    this.props.navigation.goBack();
   }

  componentDidMount() {
    const id = this.props.route.params.id;
    const type = this.props.route.params.type;
    const summaryTitle = this.props.route.params.summaryTitle;
    const storageId = 'summary_' + id;
    this.setState({storageId:storageId});
    this.setState({normalId:id});
    this.setState({type:type});
    this.setState({summaryTitle:summaryTitle});
    AsyncStorage.getItem(storageId).then((value) => this.setSkipValue(value));
  }

  async setSkipValue (value) {
    if (value !== null) {
      this.setState({ 'curSummary': value });
    } else {
      this.setState({ 'curSummary': '' });
    }
  }

  async saveSummary (text) {
    this.setState({'curSummary': text});
    await AsyncStorage.setItem(this.state.storageId, text);
  }

  async handleSubmit() {
    const user = JSON.parse(await AsyncStorage.getItem('User'));
    if (this.state.type === 'submit') {
      // post insert
      const postres = fetch (url + '/create-summary', {
        method: 'POST',
        body: JSON.stringify({
          AppointmentId: this.state.normalId,
          SummaryText: this.state.curSummary,
          UserId: user.id
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      .catch((error) => {
        console.error(error);
      });
      const statusupdateres = await fetch(url + '/update-appointment-status', {
        method: 'POST',
        body: JSON.stringify({
          Id: this.state.normalId,
          Status: 'Completed'
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      .catch((error) => {
        console.error(error);
      });
    } else {
      // post update
      const postres = fetch (url + '/update-summary', {
        method: 'POST',
        body: JSON.stringify({
          AppointmentId: this.state.normalId,
          SummaryText: this.state.curSummary,
          UserId: user.id
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      .catch((error) => {
        console.error(error);
      });
    }
    this.fadeOut();
  }

  fadeOut() {
    this.setState({ fadeOut: new Animated.Value(1), type:'edit' },
    () => {
      Animated.timing(
        this.state.fadeOut,
        {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true
        }
      ).start();
    })
  }

  render () {
    return <View style={{flex:1}}>
      <View>
        <View style={{height:25, backgroundColor: colors.vikingBlue}}></View>
        <View style={{height:30, backgroundColor: colors.white}}></View>
        <View style={{flexDirection:'row', backgroundColor: colors.white, alignItems:'center'}}>
          <View style={{width:5}}></View>
          <TouchableOpacity onPress={() => this.handleBack()} activeOpacity={0.5}>
            <Image style={{width:30, height:30}} source={require('./assets/icons8-back-50.png')} />
          </TouchableOpacity>
          <View style={{width:10}}></View>
          <View style={{width:mainTitleWidth,textAlign:'center',alignItems:'center'}}>
            <Text style={{fontSize:18}}>Edit Summary</Text>
          </View>
        </View>
        <View style={{height:30, backgroundColor: colors.white}}></View>
      </View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.summaryTitle}>{this.state.summaryTitle}</Text>
        <View style={styles.summaryInputBox}>
        <TextInput
        multiline
        numberOfLines={6}
        style={styles.summaryInput}
        onChangeText={text => this.saveSummary(text)}
        value={this.state.curSummary} />
        </View>
        <Button
          containerStyle={styles.summaryButton}
          style={styles.summaryButtonText}
          onPress={() => this.handleSubmit()}>
          Save
        </Button>
        <Animated.View style={{opacity: this.state.fadeOut}}>
          <View style={styles.savedNotification}>
            <Text style={{textAlign: 'center'}}>Summary saved!</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  }
}

class ProposeMeetingScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      refreshing : false
    };
  }

  render() {
    //
  }
}

async function getAllTopics() {

  const topicsres = await fetch(url + '/all-topics', {
    method: 'GET'
  });
  const topicsPayload = await topicsres.json();
  // console.log(topicsPayload);

  const recordSet = topicsPayload["recordset"];
  var topics = [];
  for (var i = 0; i < recordSet.length; i++) {
    const record = recordSet[i];
    const topic = {
      id: record["Id"],
      postedBy: record["PostedBy"],
      dueDate: record["DueDate"],
      dueDateText: parseDateText(new Date(record["DueDate"])),
      title: record["Title"],
      description: record["Description"],
      created: record["Created"],
      createdText: parseDateText(new Date(record["Created"])),
      lastUpdate: record["LastUpdate"]
    }
    topics.push(topic);
  }

  return topics;
}


// Topic Screen -- for displaying a list of all current and past monthly topics.

class TopicsScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      shouldUpdate: true,
      topics: []
    };
  }

  async setTopics() {
    var newTopics = [];
    var doSetAsyncStorage = false;

    try {
      newTopics = await getAllTopics();
      doSetAsyncStorage = true;
    } catch (error) {
      console.log(error);
      try {
        var tempTopics = await AsyncStorage.getItem('Topics');
        if (tempTopics != null && Array.isArray(tempMentors)) {
          newTopics = tempTopics;
        }
      } catch (error) {
        console.log(error);
      }
    }

    // if (doSetAsyncStorage) {
    //   await AsyncStorage.setItem('Topics', newTopics);
    // }

    this.setState({shouldUpdate: false, topics: newTopics});
  }

  topicItem(topic) {

    console.log("Topic Item: " + topic);

    return (
      <View style={styles.meeting}>
        <View style={styles.meetingInfo}>
          <View style={styles.meetingMainInfo}>
            <View style={styles.meetingMainRow}>
              <Text style={styles.meetingTitleText}>{topic.title}</Text>
              <View style={{width:20}}/>      
            </View>
            <View style={{height:10}}/>
            <Text style={styles.meetingDateText}>Created: {topic.createdText}</Text>
            <View style={{height:10}}/>
            <Text style={styles.meetingDateText}>Due: {topic.dueDateText}</Text>
            <View style={{height:20}}/>
            <Text>{topic.description}</Text>
          </View>
        </View>
        <Button/>
      </View>
    );
  }

  render () {

    if (this.state.shouldUpdate) {
      this.setTopics();
    }

    console.log(this.state.topics);

    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        { titleBar("Topics", () => this.props.navigation.navigate('SettingsModal')) }
        <View style={styles.meetingsGroup}>
          <Text style={styles.meetingsTitle}>Topics</Text>
        </View>
        {
          this.state.topics.map( (topic) => {
            return this.topicItem(topic);
          })
        }
      </View>
    );
  }
}

// Now has an independent titlebar housed within render, since it only has a single back button.
class HelpScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      refreshing : false
    };
  }

  render () {
    return <View>
      <View>
        <View style={{height:25, backgroundColor: colors.vikingBlue}}></View>
        <View style={{height:30, backgroundColor: colors.white}}></View>
        <View style={{flexDirection:'row', backgroundColor: colors.white, alignItems:'center'}}>
          <View style={{width:5}}></View>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('SettingsModal')} activeOpacity={0.5}>
            <Image style={{width:30, height:30}} source={require('./assets/icons8-back-50.png')} />
          </TouchableOpacity>
          <View style={{width:10}}></View>
          <View style={{width:mainTitleWidth,textAlign:'center',alignItems:'center'}}>
            <Text style={{fontSize:22}}>Help</Text>
          </View>
        </View>
        <View style={{height:30, backgroundColor: colors.white}}></View>
      </View>
      <ScrollView style={{marginBottom:80}}>
        <View style={{height:30}} />
        <View style={styles.helpContainer}>
        <Text style={styles.helpPara}>This app servers to schedule meetings between mentor-mentee pairs
        and allows users to write summaries for how each meeting went.{"\n"}{"\n"}</Text>
        <Text style={styles.helpTitle}>Home</Text>
        <Text style={styles.helpPara}>
        After an admin has assigned you a mentor and/or mentee, their profile will be
        viewable here. Tap on a user to view contact info and schedule a meeting, if they are your mentor.
        {"\n"}{"\n"}
        </Text>
        <Text style={styles.helpTitle}>Meetings</Text>
        <Text style={styles.helpPara}>
          Meetings have several status types to inform you of your progression.
          {"\n"}{"\n"}
          <Text style={styles.helpPending}>Pending</Text>
          {"\n"}
          At this stage, a mentee has proposed a meeting from Home and the mentor needs to approve it.
          {"\n"}
          <IonIcon name="ios-arrow-down" size={30} color="#000" />
          {"\n"}
          <Text style={styles.helpGreen}>Scheduled</Text>
          {"\n"}
          After the mentor accepts the proposed meeting time, it will be Scheduled. The pair should communicate to establish
          how they will meet now that they have an agreed time.
          {"\n"}
          <IonIcon name="ios-arrow-down" size={30} color="#000" />
          {"\n"}
          <Text style={styles.helpGreen}>Done</Text>
          {"\n"}
          When returning to the Meetings screen after the agreed upon time, the meeting will be Done.
          At this point, the mentee should tap on Write Summary to submit a recap of the meeting. Only the mentee writes a summary!
          {"\n"}
          <IonIcon name="ios-arrow-down" size={30} color="#000" />
          {"\n"}
          <Text style={styles.helpGreen}>Completed</Text>
          {"\n"}
          After a summary is submitted, a meeting is marked as Completed. Mentees can still make summary edits if they wish, but it's not necessary.
          {"\n"}{"\n"}
        </Text>
        <Text style={styles.helpTitle}>Topic</Text>
        <Text style={styles.helpPara}>View meeting topics for each month here. When you create a meeting proposal, it is tied to the active topic,
        and that topic will be displayed as a reminder when you go to complete your summary.
        {"\n"}{"\n"}{"\n"}{"\n"}</Text>
        </View>
      </ScrollView>
    </View>
  }
}

// SPLASH SCREEN

// For checking user login status...
class SplashScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      refreshing : false,
      'value': false
    };
  }

  componentDidMount = () => AsyncStorage.getItem('Email').then((value) => this.setSkipValue(value));

  async setSkipValue (value) {
    this.setState({ 'value': value });
    if (value !== null) {
      curUser = await getCurrentUser(value);
      await AsyncStorage.setItem('User', JSON.stringify(curUser));
    }
  }

  render () {
    if (this.state.value !== null) {
      this.props.navigation.navigate('Main');
    } else {
      this.props.navigation.navigate('Login');
    }
    return (
      <View style={{textAlign:'center',alignItems:'center'}}>
        <Text style={{fontSize:22}}>MentoringApp</Text>
      </View>
    )
  }

};

// LOGIN AND PRIVACY SCREENS

// A LoginScreen class-- used to help with some state setting problems-- "refreshing" is now within this class' scope.
// Note: the Stack Navigator automatically sets the "navigation" prop, which can be accessed via this.props.navigation.
// The original issue I stumbled across was an attempt to pass a "Type" (a clear remnant of the TypeScript source).
class LoginScreen extends React.Component {
  constructor(props) {
    super(props)
    this.isLoggedIn = false;
    this.state = {
      refreshing : false
    };
  }

  // Note: passing in handleLogin with "this" inside of a "big-arrow function" ensures handleLogin can make use of the LoginScreen state props.  Mind the this!
  render () {
    const renderButton = () => {
      return (
         <Button
           containerStyle={{padding:12, height:45, width:"45%", overflow:'hidden', borderRadius:4, backgroundColor: '#003F87'}}
           style={{fontSize: 16, color: 'white'}}
           onPress={() => this.modal.open()}>
           Sign in with LinkedIn
         </Button>
      );
    };
    return  <View style={styles.container}>
              <Image style={{width:200, height:200}} source={require('./assets/logo.png')} />
              <View style={{height:20}} />
              <LinkedInModal
                clientID="86bzo41s6bc4am"
                clientSecret="O2U1ANijJnQG2E3s"
                redirectUri="https://cs.wwu.edu/"
                ref={ref => { this.modal = ref; }}
                renderButton={renderButton}
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

      // get basic profile information
      const response = await fetch('https://api.linkedin.com/v2/me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + access_token,
        }
      });
      const payload = await response.json();

      // get profile picture URL
      const pictureres = await fetch('https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))&oauth2_access_token=' + access_token, {
        method: 'GET'
      });
      const picPayload = await pictureres.json();

      // get email address
      const emailres = await fetch('https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + access_token,
        }
      });
      const emailPayload = await emailres.json();

      const email = emailPayload.elements[0]["handle~"].emailAddress;
      const first = payload.localizedFirstName;
      const last = payload.localizedLastName;
      const pic = picPayload.profilePicture["displayImage~"].elements[2].identifiers[0].identifier;

      // check if user exists
      const checkres = await fetch(url + '/user/email/' + email, {
        method: 'GET'
      });
      const checkPayload = await checkres.json();

      // log user in locally by moving data to AsyncStorage
      try {
        await AsyncStorage.setItem('Email', email);
        await AsyncStorage.setItem('FirstName', first);
        await AsyncStorage.setItem('LastName', last);
        await AsyncStorage.setItem('Avatar', pic);
      } catch (error) {
        console.log(error);
      }

      this.setState({ refreshing: false });

      // check if this user needs to be added to DB.
      if (checkPayload.rowsAffected == 0) {

        postNewUser(email, first, last, pic);
        curUser = await getCurrentUser();
        await AsyncStorage.setItem('User', JSON.stringify(curUser));
        this.props.navigation.navigate('Privacy');

      } else {

        curUser = await getCurrentUser();
        await AsyncStorage.setItem('User', JSON.stringify(curUser));

        this.props.navigation.navigate('Main');

      }

    } else {
      console.log("Authentication Code Received: " + authentication_code);
    }
  }

}

// PrivacyScreen class
class PrivacyScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false
    }
  }

  acceptAgreement = () => {
    updatePrivacy(curUser.email, 1);
    this.props.navigation.navigate("Main");
  }

  denyAgreement = () => {
    updatePrivacy(curUser.email, 0);
    this.props.navigation.navigate("Main");
  }

  render () {
    return <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={{flexDirection:'row',justifyContent:"center"}}>
          <Image style={{width:100, height:100}} source={require('./assets/logo.png')} />
        </View>
        <Text style={styles.headerSupportPrimaryText}>Read carefully and decide below.</Text>
        <View style={{height:25}}/>
        <Text style={styles.basePrivacyText}>
        <Text style={styles.titlePrimaryText}>Privacy Policy</Text>
        {"\n"}{"\n"}
        WWU CS Department built the CS/M Mentoring app as a free app. This Service is provided by WWU CS Department at no cost and is intended for use as is. This page is used to inform visitors regarding policies with the collection, use, and disclosure of Personal Information if anyone decided to use this Service.
        {"\n"}{"\n"}
        If you choose to use this Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that collected is used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.
        {"\n"}{"\n"}
        The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, which is accessible at CS/M Mentoring unless otherwise defined in this Privacy Policy.
        {"\n"}{"\n"}
        <Text style={styles.titlePrimaryText}>Information Collection and Use</Text>
        {"\n"}{"\n"}
        For a better experience, while using our Service, we may require you to provide us with certain personally identifiable information, including but not limited to your email address, full name, and LinkedIn profile picture. The information requested will be retained on your device and CSWWU servers for the sake of connecting you with mentor/mentees.
        {"\n"}{"\n"}
        The app does use third party services that may collect information used to identify you. Information collected from this app (namely user profiles and summaries) will be provided to an NSF research group if this agreement is accepted. You can request from the email below for your account and associated application data to be deleted at any time.
        {"\n"}{"\n"}
        <Text style={styles.basePrimaryTextBolded}>If the agreement is not accepted, you may still use the app, but this information won't be shared with the research group.</Text>
        {"\n"}{"\n"}
        Link to privacy policy of third party service providers used by the app are accessible here:
        {"\n"}{"\n"}
        <Text style={{color: 'blue'}} onPress={() => Linking.openURL('https://www.linkedin.com/legal/privacy-policy')}>LinkedIn </Text>
         and <Text style={{color: 'blue'}} onPress={() => Linking.openURL('https://www.google.com/policies/privacy/')}>Google Play Services</Text> (if on Android)
        {"\n"}{"\n"}
        <Text style={styles.titlePrimaryText}>Log Data</Text>
        {"\n"}{"\n"}
        Whenever you use our Service, in a case of an error in the app we collect data and information (through third party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol (“IP”) address, device name, operating system version, the configuration of the app when utilizing my Service, the time and date of your use of the Service, and other statistics.
        {"\n"}{"\n"}
        <Text style={styles.titlePrimaryText}>Cookies</Text>
        {"\n"}{"\n"}
        Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device's internal memory.
        {"\n"}{"\n"}
        This Service does not use these “cookies” explicitly. However, the app may use third party code and libraries that use “cookies” to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service.
        {"\n"}{"\n"}
        <Text style={styles.titlePrimaryText}>Service Providers</Text>
        {"\n"}{"\n"}
        We may employ third-party companies and individuals due to the following reasons:
        {"\n"}{"\n"}
        1. To facilitate our Service;
        {"\n"}
        2. To provide the Service on our behalf;
        {"\n"}
        3. To perform Service-related services; or
        {"\n"}
        4. To assist us in analyzing how our Service is used.
        {"\n"}{"\n"}
        I want to inform users of this Service that these third parties have access to your Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.
        {"\n"}{"\n"}
        <Text style={styles.titlePrimaryText}>Security</Text>
        {"\n"}{"\n"}
        We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
        {"\n"}{"\n"}
        <Text style={styles.titlePrimaryText}>Links to Other Sites</Text>
        {"\n"}{"\n"}
        This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
        {"\n"}{"\n"}
        <Text style={styles.titlePrimaryText}>Changes to This Privacy Policy</Text>
        {"\n"}{"\n"}
        We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page.
        {"\n"}{"\n"}
        This policy is effective as of Jan 1st, 2021.
        {"\n"}{"\n"}
        <Text style={styles.titlePrimaryText}>Contact Us</Text>
        {"\n"}{"\n"}
        If you have any questions or suggestions about this Privacy Policy, do not hesitate to contact us at cs.support@wwu.edu.
        </Text>
        <View style={{height:25}} />
        <View style={{flexDirection:"row", alignItems:"center", justifyContent:"center"}}>
          <Button
            containerStyle={{padding:12, height:45, width:"45%", overflow:'hidden', borderRadius:4, backgroundColor: '#95a5a6'}}
            style={{fontSize: 16, color: 'white'}}
            onPress={() => this.denyAgreement()}>
            Disagree
          </Button>
          <View style={{width:10}} />
          <Button
            containerStyle={{padding:12, height:45, width:"45%", overflow:'hidden', borderRadius:4, backgroundColor: '#003F87'}}
            style={{fontSize: 16, color: 'white'}}
            onPress={() => this.acceptAgreement()}>
            Agree
          </Button>
        </View>
        <View style={{height:25}} />
      </ScrollView>
    </SafeAreaView>
  }
}

class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false
    }
  }

  logout = () => {
    AsyncStorage.clear();
    this.props.navigation.navigate('Login');
  }

  render () {
    //
    return <View>
      <View>
        <View style={{height:25, backgroundColor: colors.vikingBlue}}></View>
        <View style={{height:30, backgroundColor: colors.white}}></View>
        <View style={{flexDirection:'row', backgroundColor: colors.white, alignItems:'center'}}>
          <View style={{width:5}}></View>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()} activeOpacity={0.5}>
            <Image style={{width:30, height:30}} source={require('./assets/icons8-back-50.png')} />
          </TouchableOpacity>
          <View style={{width:10}}></View>
          <View style={{width:mainTitleWidth,textAlign:'center',alignItems:'center'}}>
            <Text style={{fontSize:22}}>Settings</Text>
          </View>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('HelpModal')} activeOpacity={0.5}>
            <Image style={{width:30, height:30}} source={require('./assets/help.png')} />
          </TouchableOpacity>
        </View>
        <View style={{height:30, backgroundColor: colors.white}}></View>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={{height:30}}></View>
        <View style={{justifyContent: 'center',
        alignItems: 'center',}}>
          <Button
            containerStyle={{padding:12, height:45, width:"45%", overflow:'hidden', borderRadius:4, backgroundColor: colors.red}}
            style={{fontSize: 16, color: 'white'}}
            onPress={() => this.logout()}>
            Log Out
          </Button>
          <View style={{height:30}} />
          <Text>
            <Text style={styles.basePrivacyText}>MentoringApp v1.0</Text>
          </Text>
          <View style={{height:15}} />
        </View>
      </ScrollView>
    </View>
  }
}

// APP CONTAINER

// Main class for app. Responsible for rendering app container.
export default class AppContainer extends React.Component {

  // Main rendering function. Always begins on the SplashScreen.
  // Note: The Login and Privacy screens have been added to the Stack Navigator.
  //        I found that React Navigation creates problems when trying to pass along state.
  render() {
    return (
        <NavigationContainer>
          <Stack.Navigator headerMode='none' initialRouteName='Splash'>
            <Stack.Screen name='Splash' component={SplashScreen} />
            <Stack.Screen name='Login' component={LoginScreen} />
            <Stack.Screen name='Privacy' component={PrivacyScreen} />
            <Stack.Screen name='Main' component={HomeStack} />
            <Stack.Screen name='SettingsModal' component={SettingsScreen} />
            <Stack.Screen name='HelpModal' component={HelpScreen} />
            <Stack.Screen name='ProposeMeeting' component={ProposeMeetingScreen} />
            <Stack.Screen name='WriteSummary' component={WriteSummaryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
    );
  }

};
