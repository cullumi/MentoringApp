



import React, { useState, useEffect } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { mainTitleWidth, styles, colors } from './Styles.js';
import { getTopic, getSummary, createSummary, updateSummary, updateAppointmentStatus, deleteSummary } from './API.js';
import Button from 'react-native-button';
import { UnifiedTitleBar } from './ScreenComponents.js';
import { accountID, accountType, url, loadLocal, getLocalUser } from './globals.js';

export default function TopicsScreen() {
  const [storageId, setStorageId] = useState('')
  const [appointmentId, setAppointmentId] = useState('')
  const [type, setType] = useState('')
  const [summaryText, setSummaryText] = useState('')
  const [summaryTitle, setSummaryTitle] = useState('')
  const [fade, setFade] = useState(new Animated.Value(0))
  const [topic, setTopic] = useState([])
  const navigation = useNavigation();
  const route = useRoute();

  const componentDidMount = () => {
    console.log('WriteSummaryScreen mounted');
    setAppointmentId(route.params.id);
    setStorageId('summary_' + appointmentId);
    setType(route.params.type);
    setSummaryTitle(route.params.summaryTitle);
    getTopic(route.params.topicId)
    .then((newTopic) => { setTopic(newTopic) });
    console.log('finished mounting - summaryText1:', summaryText);
    AsyncStorage.getItem(storageId).then((savedSummary) => setSkipValue(savedSummary, appointmentId, type));
    console.log('finished mounting - summaryText2:', summaryText);
  }

  const componentDidUpdate = () => {
    if (fade.value == 1) {
      Animated.timing(
        fade,
        {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true
        }
      ).start();
    }
  }

  const handleBack = () => {
    navigation.goBack();
  }

  const setSkipValue = async (sumText, appId, type) => {
    if (sumText !== null) {
      console.log('saved - use what\' local');
      setSummaryText(sumText);
    } else {
      if (type === 'edit') {
        // Move to API.js
        console.log('editing - getSummary');
        const summary = await getSummary(appId);
        setSummaryText(summary.SummaryText);
      } else {
        console.log('brand new - leave it blank');
        setSummaryText('');
      }
    }
  }

  const saveSummary = async (text) => {
    setSummaryText(text)
    await AsyncStorage.setItem(storageId, text);
  }

  const handleSubmit = async () => {
    const user = await getLocalUser('WriteSummaryScreen (handleSubmit)');
    // Move to API.js
    if (type === 'submit') {
      await createSummary(appointmentId, summaryText, user.Id);
      await updateAppointmentStatus(appointmentId, 'Completed', user.Id);
    } else {
      console.log(appointmentId + " " + summaryText + " " + user.Id);
      await updateSummary(appointmentId, summaryText, user.Id);
    }
    fadeOut();
  }

  const fadeOut = () => {
    setFade(new Animated.Value(1));
    setType('edit');
  }

  const markMissedMeeting = async (appId) => {
    // Move to API.js
    // Mark Appointment as 'Missed'
    const user = await getLocalUser('WriteSummaryScreen (markMissedMeeting)'); //JSON.parse(await AsyncStorage.getItem('User'));
    await updateAppointmentStatus(appId, 'Missed', user.Id);
    // Delete any summary the user may have submitted accidentally...
    await deleteSummary(appId, user.Id);
    handleBack();
  }

  const markMissedAlert = (appId) => {
    Alert.alert(
      "Mark as Missed?",
      "If you or your mentor were unable to attend this meeting, mark it as missed.",
      [
        {
          text: "Nevermind",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Confirm", onPress: () => markMissedMeeting(appId) }
      ],
      { cancelable: false }
    );
  }

  useEffect(() => {
    componentDidMount();
  }, [])

  useEffect(() => {
    componentDidUpdate();
  })

  const topicDisplay = () => {
    return (
      <View style={styles.topicContainer}>
          <View style={styles.topicHeader}>
            <Text style={styles.topicTitleText}>{topic.Title}</Text>
            <Text style={styles.topicHeaderDateText}>{topic.CreatedText}</Text>
          </View>
          <View style={styles.topicInfo}>
            <Text style={styles.topicDateText}>Due: {topic.DueDateText}</Text>
            <Text>{topic.Description}</Text>
          </View>
      </View>
    );
  }

  const summaryEditor = () => {
    return (
      <View>
        <View style={styles.summaryInputBox}>
          <TextInput
            multiline
            numberOfLines={6}
            style={styles.summaryInput}
            onChangeText={text => saveSummary(text)}
            value={summaryText} />
        </View>
        <Button
            containerStyle={styles.summaryButton}
            style={styles.summaryButtonText}
            onPress={() => handleSubmit()}>
          Save
        </Button>
        <Animated.View style={{opacity: fade}}>
          <View style={styles.savedNotification}>
            <Text style={{textAlign: 'center'}}>Summary saved!</Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  return ( 
    <View style={{flex:1}}>
      <UnifiedTitleBar title='Edit Summary' typeLeft='back' typeRight='trash' onPressRight={() => markMissedAlert(appointmentId)} />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.reminderText}>Review this meeting's topic then scroll down:</Text>
        {topicDisplay()}
        <Text style={styles.summaryTitle}>{summaryTitle}</Text>
        {summaryEditor()}
      </ScrollView>
    </View>
  );
}