


import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, RefreshControl, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import  {TitleBar, UnifiedTitleBar} from './ScreenComponents.js';
import { styles, colors } from './Styles.js';
import { getMentorsOf, getMenteesOf, getCurrentUser, checkMeetings, updateAppointmentStatus, createSummary } from './API.js';
import { useNotification } from './PushNotifs.js';
import { saveLocals, loadLocalArray } from './globals.js';

export default function HomeScreen() {
  const [shouldUpdate, setShouldUpdate] = useState(true);
  const [refreshControl, setRefreshControl] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [meetingPromptModalVisible, setMeetingPromptModalVisible] = useState(false);
  const [writeSummaryModalVisible, setWriteSummaryModalVisible] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [meeting, setMeeting] = useState({
      "MentorFirstName":"",
      "Avatar": "",
      "Id": "",
      "topic": {
          "Title":"",
          "createdText":"",
          "dueDateText":"",
          "Description":""
  }});
  const navigation = useNavigation();
  const route = useRoute();

  const setPairs = async () => {
    var newMentors = [];
    var newMentees = [];
    var doSetAsyncStorage = false;
    try {
      const curUser = await getCurrentUser("Home");
      newMentees = await getMenteesOf(curUser.Id);
      newMentors = await getMentorsOf(curUser.Id);
      doSetAsyncStorage = true;
    } catch (error) {
      console.log(error);
      newMentors = await loadLocalArray('Mentors', newMentors);
      newMentees = await loadLocalArray('Mentees', newMentees);
    }
    // Save mentor/mentee info from the database into local storage, for when you're offline.
    if (doSetAsyncStorage) {
      await saveLocals(["Mentors", "Mentees"], [mentors, mentees]);
    }
    setRefreshControl(false);
    setShouldUpdate(false);
    setMentors(newMentors);
    setMentees(newMentees);
    // console.log('newMentors:', newMentors);
    // console.log('newMentees:', newMentees);
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

  const onRefresh = () => {
    setRefreshControl(true);
    setPairs();
  };

  const submitModalSummary = async (id) => {
    const user = JSON.parse(await AsyncStorage.getItem('User'));
    createSummary(id, summaryText, user.id);
    updateAppointmentStatus(id, 'Completed')
    refreshMeetings('')
  };

  const refreshMeetings = async (sumText) => {
    var meetings = await checkMeetingsHome();
    if (meetings && meetings.length > 0) {
      for (var meetingC = 0; meetingC < meetings.length; meetingC++) {
        if (meetings[meetingC].updated == true) {
          setSummaryText(sumText);
          setMeeting(meetings[meetingC]);
          setMeetingPromptModalVisible(true);
          meetingC = meetings.length;
        } else if (meetingC == meetings.length-1) {
          setSummaryText(sumText);
          setWriteSummaryModalVisible(false);
        }
      }
    } else {
      setSummaryText(sumText);
      setWriteSummaryModalVisible(false);
    }
  };

  const processMeeting = async (ret, meeting) => {
    if (ret == 'missed') {
      updateAppointmentStatus(meeting.id, 'Missed');
      refreshMeetings(summaryText);
    } else {
      setWriteSummaryModalVisible(true);
      setMeetingPromptModalVisible(false);
    }
  }

  const approvedHome = () => { // removed accountID from approvedHome() parameters
    return (
      <ScrollView contentContainerStyle={styles.scrollView}//{flex: 1, flexDirection: 'column'}}
          refreshControl={
            <RefreshControl refreshing={refreshControl} onRefresh={onRefresh} />
          }>
        <View style={styles.meetingsGroup}>
          <Text style={styles.meetingsTitle}>Mentors</Text>
        </View>
        { mentors.map( (mentor, i) => { return pairItem(mentor, "Mentor", i); }) }
        <View style={styles.meetingsGroup}>
          <Text style={styles.meetingsTitle}>Mentees</Text>
        </View>
        { mentees.map( (mentee, i) => { return pairItem(mentee, "Mentee", i); }) }
      </ScrollView>
    );
  };

  const pairItem = (otherUser, otherType, i=0) => {
    return (
      <View key={i}>
        <TouchableOpacity onPress={() =>
          navigation.navigate('ContactInfo', { user: otherUser, type: otherType })} key={otherUser.Id.toString()} style={styles.homeItem} >
          <View style={styles.homeAvatarColumn}>
            <Image style={styles.homeItemAvatar} source={{uri: otherUser.Avatar}} />
            <View style={otherUser.homeBoxStyle}>
              <Text style={styles.homeTag}>{ otherType } </Text>
            </View>
          </View>
          <View style={styles.homeItemInfo}>
            <Text style={styles.homeItemName}>{otherUser.FirstName + " " + otherUser.LastName}</Text>
            <Text style={styles.homeItemEmail}>{otherUser.Email}</Text>
          </View>
          <View style={styles.homeItemForward}>
            <IonIcon type='Ionicons' name='ios-arrow-forward' size={30} color={colors.vikingBlue}  />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const componentDidMount = async () => {
    // useNotification();
    console.log("Main Screen Mounted");
    if (shouldUpdate) {
      setPairs();
      var meetings = await checkMeetings();
      if (meetings && meetings.length > 0) {
        for (var meetingC = 0; meetingC < meetings.length; meetingC++) {
          if (meetings[meetingC].updated == true) {
            setMeeting(meetings[meetingC]);
            setMeetingPromptModalVisible(true);
            meetingC = meetings.length;
    }}}}
  };

  useEffect( () => {
    componentDidMount();
  }, []);

  const WriteSummaryModal = () => {
    return (
      <Modal
          animationType="slide"
          transparent={true}
          visible={writeSummaryModalVisible}>
        <View style={styles.writeSummaryModalContainer}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.reminderText}>Review this meeting's topic then scroll down:</Text>
            <View style={styles.topicContainer}>
              <View style={styles.topicHeader}>
                <Text style={styles.topicTitleText}>{meeting.topic.Title}</Text>
                <Text style={styles.topicHeaderDateText}>{meeting.topic.createdText}</Text>
              </View>
              <View style={styles.topicInfo}>
                <Text style={styles.topicDateText}>Due: {meeting.topic.dueDateText}</Text>
                <Text>{meeting.topic.Description}</Text>
              </View>
            </View>
            <Text style={styles.reminderText}>Reflect on your conversation with { meeting.MentorFirstName }:</Text>
            <View style={styles.summaryModalInputBox}>
              <TextInput
                  multiline
                  numberOfLines={6}
                  style={styles.summaryModalInput}
                  onChangeText={text => setCurrentSummary(text)}
                  value={summaryText} />
            </View>
            <Button
                containerStyle={styles.submitSummaryModalButton}
                style={styles.summaryButtonText}
                onPress={() => submitModalSummary(meeting.Id)}>
              Submit Summary
            </Button>
          </ScrollView>
        </View>
      </Modal>
    );
  }

  const MeetingPromptModal = () => {
    return (
      <Modal
          animationType="slide"
          transparent={true}
          visible={meetingPromptModalVisible}>
        <View style={styles.meetingPromptModalContainer}>
          <Image style={styles.bigAvatar} source={{uri: meeting.Avatar}} />
          <Text style={styles.meetingPromptModalHeader}>Meeting Debrief</Text>
          <Text style={styles.meetingPromptModalText}>Did you have a meeting with { meeting.MentorFirstName }?</Text>
          <Button
              containerStyle={styles.meetingPromptModalConfirm}
              style={styles.summaryButtonText}
              onPress={() => processMeeting('confirmed', meeting)}>
            Yes, We Met
          </Button>
          <Button
              containerStyle={styles.meetingPromptModalMissed}
              style={styles.summaryButtonText}
              onPress={() => processMeeting('missed', meeting)}>
            Meeting Was Missed
          </Button>
        </View>
      </Modal>
    );
  }

  return (
    <View style={{flex: 1, flexDirection: 'column'}}>
      <UnifiedTitleBar title="Home" typeRight='settings' />
      { route.params.accountType == 1 ? unapprovedAccount() : approvedHome() }
      <MeetingPromptModal/>
      <WriteSummaryModal/>
    </View>
  );
}