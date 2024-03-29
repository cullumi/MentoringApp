



import React, { useState, useEffect } from 'react';
import {View, Text, Image, ScrollView, RefreshControl, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {TitleBar, UnifiedTitleBar} from './ScreenComponents.js';
import {styles, colors} from './Styles.js';
import {getAppointments, updateAppointmentStatus} from './API.js';
import {url} from './globals';
import Button from 'react-native-button';

export default function MeetingsScreen() {
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pastMeetings, setPastMeetings] = useState([]);
  const [pastRefreshing, setPastRefreshing] = useState([]);
  const [upcomingRefreshing, setUpcomingRefreshing] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [keyUpdate, setKeyUpdate] = useState(true);
  const [refreshControl, setRefreshControl] = useState(true);
  const navigation = useNavigation();

  const componentDidMount = () => {
    onRefresh();
    // getData();
  }

  const componentDidUpdate = () => {
    if (refreshing == true) {
      getAppointments('upcoming')
      .then((data) => {
        setUpcomingMeetings(data);
        setRefreshing(false);
      });
    }
  }

  const resetRefresh = () => {
    if (!(pastRefreshing && upcomingRefreshing)) {
      setRefreshing(false);
      setRefreshControl(false);
    }
  }

  const getData = () => {
    Alert.alert('Data Gotten');
    setPastRefreshing(true);
    getAppointments('past')
    .then((meetings) => {
      setPastMeetings(meetings);
      setPastRefreshing(false);
      resetRefresh();
    });
    setUpcomingRefreshing(true);
    getAppointments('upcoming')
    .then((meetings) => {
      setUpcomingMeetings(meetings);
      setUpcomingRefreshing(false);
      resetRefresh();
    });
  }

  // Might need to modify this
  const onRefresh = () => {
    setRefreshControl(true)
    getData();
  }

  const acceptMeeting = async (id) => {
    updateAppointmentStatus(id, 'Scheduled');
    onRefresh();
  }

  const acceptMeetingAlert = (id) => {
    console.log('Alert: Accept Meeting Time');
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
        { text: "Confirm", onPress: () => acceptMeeting(id) }
      ],
      { cancelable: false }
    );
  }

  const cancelMeeting = async (id) => {
    updateAppointmentStatus(id, 'Canceled');
    onRefresh();
  }

  const cancelMeetingAlert = (id) => {
    console.log('Alert: Cancel Meeting Alert');
    // Check if the user is sure they want to cancel this meeting.
    Alert.alert(
      "Cancel Meeting",
      "Are you sure you want to cancel? The mentee will need to schedule a new meeting.",
      [
        { text: "Nevermind", onPress: () => console.log("Cancel Pressed"), style: "cancel" },
        { text: "Confirm", onPress: () => cancelMeeting(id) },
      ],
      { cancelable: false }
    );
  }

  const handlePress = (type, id, topicId, str) => {
    switch(type) {
      case 'accept':
        acceptMeetingAlert(id);
        setRefreshing(true);
        break;
      case 'cancel':
        cancelMeetingAlert(id);
        setRefreshing(true);
        break;
      case 'submitSummary':
        console.log('Navigate: Submit Summary');
        navigation.navigate('WriteSummary', { id: id, topicId: topicId, type: 'submit', summaryTitle: str});
        break;
      case 'editSummary':
        console.log('Navigate: Edit Summary');
        navigation.navigate('WriteSummary', { id: id, topicId: topicId, type: 'edit', summaryTitle: str});
        break;
    }
  }

  const onPressWrapper = (m, onPress) => { return () => onPress(m); };
  const printMeetingsList = (meetings, onPress=(m) => handlePress(m.buttonPress, m.Id)) => {
    return (
      meetings.map((m, i) => {
        return (
          <View key={i} style={styles.meeting}>
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
              onPress={onPressWrapper(m, onPress)}
              disabled={m.buttonDisabled}>
              {m.buttonText}
              </Button>
          </View>
        );
      })
    );
  }

  const pastOnPress = (m) => handlePress(m.buttonPress, m.Id, m.TopicId, m.summaryTitle);
  const printPastMeetings = () => {
    console.log("Past Meetings"); //:", JSON.stringify(pastMeetings));
    return (
      <View>{ 
          (() => {if (pastMeetings[0] !== undefined) {
            return(
              <View>
                <View style={styles.meetingsGroup}>
                  <Text style={styles.meetingsTitle}>Past</Text>
                </View>
                {printMeetingsList(pastMeetings, pastOnPress)}
              </View>
            );
          } else {
            return (<View/>);
          }})()
        }
        <View style={{height: 15}}/>
      </View>
    );
  }

  const upcomingOnPress = (m) => handlePress(m.buttonPress, m.Id);
  const printUpcomingMeetings = () => {
    console.log("Upcoming Meetings");//: " + JSON.stringify(upcomingMeetings));
    return (
      <View>
        <View style={styles.meetingsGroup}>
          <Text style={styles.meetingsTitle}>Upcoming</Text>
        </View>
        { 
          (() => {if (upcomingMeetings[0] !== undefined) {
            return printMeetingsList(upcomingMeetings, upcomingOnPress);
          } else {
            return (<Text style={styles.meetingsPrimaryNone}>No scheduled meetings!</Text>);
          }})()
        }
      </View>
    );
  }

  useEffect(() => {
    componentDidMount();
    const willFocusSubscription = navigation.addListener('focus', () => {getData();});
    return willFocusSubscription;
  }, []);

  useEffect(() => {
    componentDidUpdate();
  });

  return (
    <View style={{flex:1}} key={refreshing}>
      <UnifiedTitleBar title="Meetings" typeRight='settings' />
      <ScrollView contentContainerStyle={styles.scrollView}
          refreshControl={
              <RefreshControl refreshing={refreshControl} onRefresh={onRefresh} />
          }>
        { printUpcomingMeetings() }
        { printPastMeetings() }
      </ScrollView>
    </View>
  );
}