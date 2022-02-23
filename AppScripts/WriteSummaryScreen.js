



import React, { useState, useEffect } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { mainTitleWidth, styles, colors } from './Styles.js';
import { getTopic, getSummary, createSummary, updateSummary, updateAppointmentStatus, deleteSummary } from './API.js';
import Button from 'react-native-button';
import { accountID, accountType, url, loadLocal, getLocalUser } from './globals.js';

export default function TopicsScreen() {
  const [storageId, setStorageId] = useState('')
  const [normalId, setNormalId] = useState(-1)
  const [topicId, setTopicId] = useState('')
  const [type, setType] = useState('')
  const [curSummary, setCurSummary] = useState('')
  const [summaryTitle, setSummaryTitle] = useState('')
  const [fade, setFade] = useState(new Animated.Value(0))
  const [topic, setTopic] = useState([])
  const navigation = useNavigation();
  const route = useRoute();

  const componentDidMount = () => {
    const id = route.params.id;
    const topicId = route.params.topicId;
    const type = route.params.type;
    const summaryTitle = route.params.summaryTitle;
    const storageId = 'summary_' + id;
    setStorageId(storageId);
    setNormalId(id);
    setTopicId(topicId);
    setType(type);
    setSummaryTitle(summaryTitle);
    AsyncStorage.getItem(storageId).then((value) => setSkipValue(value, id, type));
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

  const getData = () => {
    getTopic(topicId)
    .then((data) => { setTopic(data) });
  }

  const handleBack = () => {
    route.params.onGoBack();
    navigation.goBack();
  }

  const setSkipValue = async (value, id, type) => {
    if (value !== null) {
      setCurSummary(value);
    } else {
      if (type === 'edit') {
        // Move to API.js
        const summary = await getSummary(id);
        setCurSummary(summary.SummaryText);
      } else {
        setCurSummary('');
      }
    }
  }

  const saveSummary = async (text) => {
    setCurSummary(text)
    await AsyncStorage.setItem(storageId, text);
  }

  const handleSubmit = async () => {
    const user = await getLocalUser('WriteSummaryScreen (handleSubmit)');
    // Move to API.js
    if (type === 'submit') {
      await createSummary(id, curSummary, user.Id);
      await updateAppointmentStatus(normalId, 'Completed', user.Id);
    } else {
      console.log(normalId + " " + curSummary + " " + user.Id);
      await updateSummary(normalId, curSummary, user.Id);
    }
    fadeOut();
  }

  const fadeOut = () => {
    setFade(new Animated.Value(1));
    setType('edit');
  }

  const markMissedMeeting = async (id) => {
    // Move to API.js
    // Mark Appointment as 'Missed'
    const user = await getLocalUser('WriteSummaryScreen (markMissedMeeting)'); //JSON.parse(await AsyncStorage.getItem('User'));
    await updateAppointmentStatus(id, 'Missed', user.Id);
    // Delete any summary the user may have submitted accidentally...
    await deleteSummary(appId, user.Id);
    handleBack();
  }

  const markMissedAlert = (id) => {
    Alert.alert(
      "Mark as Missed?",
      "If you or your mentor were unable to attend this meeting, mark it as missed.",
      [
        {
          text: "Nevermind",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Confirm", onPress: () => markMissedMeeting(id) }
      ],
      { cancelable: false }
    );
  }

  useEffect(() => {
    getData();
    componentDidMount();
  }, [])

  useEffect(() => {
    componentDidUpdate();
  })

  return ( 
    <View style={{flex:1}}>
      <View>
        <View style={{height:25, backgroundColor: colors.vikingBlue}}></View>
        <View style={{height:30, backgroundColor: colors.white}}></View>
        <View style={{flexDirection:'row', backgroundColor: colors.white, alignItems:'center'}}>
          <TouchableOpacity style={{marginLeft:15,width:30}} onPress={() => handleBack()} activeOpacity={0.5}>
            <IonIcon type='Ionicons' name='ios-arrow-back' size={30} color={colors.vikingBlue} />
          </TouchableOpacity>
          <View style={{width:mainTitleWidth,textAlign:'center',alignItems:'center'}}>
            <Text style={{fontSize:18}}>Edit Summary</Text>
          </View>
          <TouchableOpacity onPress={() => markMissedAlert(normalId)} activeOpacity={0.5}>
              <IonIcon name="ios-trash" size={30} color={colors.red} />
          </TouchableOpacity>
        </View>
        <View style={{height:30, backgroundColor: colors.white}}></View>
      </View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.reminderText}>Review this meeting's topic then scroll down:</Text>
        <View style={styles.topicContainer}>
          <View style={styles.topicHeader}>
            <Text style={styles.topicTitleText}>{topic.Title}</Text>
            <Text style={styles.topicHeaderDateText}>{topic.createdText}</Text>
          </View>
          <View style={styles.topicInfo}>
            <Text style={styles.topicDateText}>Due: {topic.dueDateText}</Text>
            <Text>{topic.Description}</Text>
          </View>
        </View>
        <Text style={styles.summaryTitle}>{summaryTitle}</Text>
        <View style={styles.summaryInputBox}>
          <TextInput
            multiline
            numberOfLines={6}
            style={styles.summaryInput}
            onChangeText={text => saveSummary(text)}
            value={curSummary} />
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
      </ScrollView>
    </View>
  );
}

/*
export default class WriteSummaryScreen extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        storageId: '',
        normalId: -1,
        type: '',
        curSummary: '',
        summaryTitle: '',
        fadeOut: new Animated.Value(0),
        topic: []
      }
    }

    handleBack() {
      route.params.onGoBack();
      this.props.navigation.goBack();
     }

    componentDidMount() {
      const id = route.params.id;
      const topicId = route.params.topicId;
      const type = route.params.type;
      const summaryTitle = route.params.summaryTitle;
      const storageId = 'summary_' + id;
      this.setState({storageId:storageId,normalId:id,topicId:topicId,type:type,summaryTitle:summaryTitle});
      AsyncStorage.getItem(storageId).then((value) => this.setSkipValue(value, id, type));
    }

    getData() {
      getTopic(this.state.topicId)
      .then((data) => {
        this.setState({
          topic:data
        })
      });
    }

    async setSkipValue (value, id, type) {
      if (value !== null) {
        this.setState({ 'curSummary': value });
      } else {
        if (type === 'edit') {
          const summaryres = await fetch(url + '/summary/appointment/' + id, {
            method: 'GET'
          });
          const summaryPayload = await summaryres.json();
          var summary = summaryPayload['recordset'][0].SummaryText;
          this.setState({ 'curSummary': summary });
        } else {
          this.setState({ 'curSummary': '' });
        }
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
            UserId: user.Id
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
        console.log(this.state.normalId + " " + this.state.curSummary + " " + user.Id);
        // post update
        const postres = fetch (url + '/update-summary', {
          method: 'POST',
          body: JSON.stringify({
            AppointmentId: this.state.normalId,
            SummaryText: this.state.curSummary,
            UserId: user.Id
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

    async markMissedMeeting(id) {
      // Mark Appointment as 'Missed'
      const statusupdateres = await fetch(url + '/update-appointment-status', {
        method: 'POST',
        body: JSON.stringify({
          Id: id,
          Status: 'Missed'
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      .catch((error) => {
        console.error(error);
      });
      // Delete any summary the user may have submitted accidentally...
      const user = JSON.parse(await AsyncStorage.getItem('User'));
      const postres = fetch (url + '/delete-summary', {
        method: 'POST',
        body: JSON.stringify({
          AppointmentId: id,
          UserId: user.Id
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      .catch((error) => {
        console.error(error);
      });
      this.handleBack();
    }

    markMissedAlert(id) {
      Alert.alert(
        "Mark as Missed?",
        "If you or your mentor were unable to attend this meeting, mark it as missed.",
        [
          {
            text: "Nevermind",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "Confirm", onPress: () => this.markMissedMeeting(id) }
        ],
        { cancelable: false }
      );
    }

    render () {

      this.getData();

      return <View style={{flex:1}}>
        <View>
          <View style={{height:25, backgroundColor: colors.vikingBlue}}></View>
          <View style={{height:30, backgroundColor: colors.white}}></View>
          <View style={{flexDirection:'row', backgroundColor: colors.white, alignItems:'center'}}>
            <TouchableOpacity style={{marginLeft:15,width:30}} onPress={() => this.handleBack()} activeOpacity={0.5}>
              <IonIcon type='Ionicons' name='ios-arrow-back' size={30} color={colors.vikingBlue} />
            </TouchableOpacity>
            <View style={{width:mainTitleWidth,textAlign:'center',alignItems:'center'}}>
              <Text style={{fontSize:18}}>Edit Summary</Text>
            </View>
            <TouchableOpacity onPress={() => this.markMissedAlert(this.state.normalId)} activeOpacity={0.5}>
                <IonIcon name="ios-trash" size={30} color={colors.red} />
            </TouchableOpacity>
          </View>
          <View style={{height:30, backgroundColor: colors.white}}></View>
        </View>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.reminderText}>Review this meeting's topic then scroll down:</Text>
          <View style={styles.topicContainer}>
            <View style={styles.topicHeader}>
              <Text style={styles.topicTitleText}>{this.state.topic.Title}</Text>
              <Text style={styles.topicHeaderDateText}>{this.state.topic.createdText}</Text>
            </View>
            <View style={styles.topicInfo}>
              <Text style={styles.topicDateText}>Due: {this.state.topic.dueDateText}</Text>
              <Text>{this.state.topic.Description}</Text>
            </View>
          </View>
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
*/
