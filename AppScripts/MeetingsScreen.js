



import React, { useState } from 'react';
import {View, Text, Image, ScrollView, RefreshControl, Alert} from 'react-native';
import {TitleBar} from './ScreenComponents.js';
import {styles, colors} from './Styles.js';
import {getAppointments} from './API.js';
import {url} from './globals';
import Button from 'react-native-button';

export function MeetingsScreen() {
  const [toolTipVisible, setToolTipVisible] = useState(false)
  const [upcomingMeetings, setUpcomingMeetings] = useState([])
  const [pastMeetings, setPastMeetings] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [keyUpdate, setKeyUpdate] = useState(true)
  const [refreshControl, setRefreshControl] = useState(true)

  const componentDidMount = () => {
    this.getData();
  }

  const componentDidUpdate = () => {
    if (this.state.refreshing == true) {
      getMeetings('upcoming')
      .then((data) => {
        setUpcomingMeetings(data);
        setRefreshing(false);
      });
    }
  }

  const getData = () => {
    getMeetings('past')
    .then((data) => {
      setPastMeetings(data);
      setRefreshing(false);
    });
    getMeetings('upcoming')
    .then((data) => {
      setUpcomingMeetings(data);
      setRefreshing(false);
      setRefreshControl(false);
    });
  }

  const onRefresh = () => {
    setRefreshControl(true)
    this.getData();
  }

  const acceptMeeting = async (id) => {
    updateAppointmentStatus(id, 'Scheduled');
    setRefreshing(true);
  }

  const acceptMeetingAlert = (id) => {
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

  const cancelMeeting = async (id) => {
    updateAppointmentStatus(id, 'Canceled');
  }

  const cancelMeetingAlert = (id) => {
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

  const handlePress = (type, id, topicId, str) => {
    switch(type) {
      case 'accept':
      this.acceptMeetingAlert(id);
      setRefreshing(true);
      break;
      case 'cancel':
      this.cancelMeetingAlert(id);
      setRefreshing(true);
      break;
      case 'submitSummary':
      this.props.navigation.navigate('WriteSummary', { id: id, topicId: topicId, type: 'submit', summaryTitle: str, onGoBack: () => this.getData() });
      break;
      case 'editSummary':
      this.props.navigation.navigate('WriteSummary', { id: id, topicId: topicId, type: 'edit', summaryTitle: str, onGoBack: () => this.getData() });
      break;
    }
  }

  const printPastMeetings = () => {
    console.log("Past Meetings: " + JSON.stringify(this.state.pastMeetings));
    if (this.state.pastMeetings[0] !== undefined) {
      return (<View>
        <View style={styles.meetingsGroup}>
          <Text style={styles.meetingsTitle}>Past</Text>
        </View>
        { this.state.pastMeetings.map((m, i) => {
          return (<View key={i} style={styles.meeting}>
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
              onPress={() => this.handlePress(m.buttonPress, m.Id, m.TopicId, m.summaryTitle)}
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

  const printUpcomingMeetings = () => {
    console.log("Upcoming Meetings: " + JSON.stringify(this.state.upcomingMeetings));
    if (this.state.upcomingMeetings[0] !== undefined) {
      return (<View>
        <View style={styles.meetingsGroup}>
          <Text style={styles.meetingsTitle}>Upcoming</Text>
        </View>
        { this.state.upcomingMeetings.map((m, i) => {
          return (<View key={i} style={styles.meeting}>
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
        </View>
        <Text style={styles.meetingsPrimaryNone}>No scheduled meetings!</Text>
      </View>);
    }

  }

  return (
    <View style={{flex:1}} key={this.state.refreshing}>
      <TitleBar
          title="Meetings"
          navFunction={() => this.props.navigation.navigate('SettingsModal')}
          navigation={this.props.navigation} />
      <ScrollView contentContainerStyle={styles.scrollView}
          refreshControl={
              <RefreshControl refreshing={this.state.refreshControl} onRefresh={this.onRefresh.bind(this)} />
          }>
        { this.printUpcomingMeetings() }
        { this.printPastMeetings() }
      </ScrollView>
    </View>
  );
}

/*
// MEETING SCREENS
export default class MeetingsScreen extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        toolTipVisible: false,
        upcomingMeetings: [],
        pastMeetings: [],
        refreshing: false,
        keyUpdate: 1,
        refreshControl: true
      };
    }

    componentDidMount() {
      this.getData();
    };

    componentDidUpdate() {
      if (this.state.refreshing == true) {
        getMeetings('upcoming')
        .then((data) => {
          this.setState({
            upcomingMeetings:data,
            refreshing: false
          })
        });
      }
    };

    getData() {
      getMeetings('past')
      .then((data) => {
        this.setState({
          pastMeetings:data,
          refreshing: false
        })
      });
      getMeetings('upcoming')
      .then((data) => {
        this.setState({
          upcomingMeetings:data,
          refreshing: false,
          refreshControl:false
        })
      });
    }

    onRefresh() {
      this.setState({refreshControl:true});
      this.getData();
    }

    async acceptMeeting (id) {
      updateAppointmentStatus(id, 'Scheduled');
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
      updateAppointmentStatus(id, 'Canceled');
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

    handlePress = (type, id, topicId, str) => {
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
        this.props.navigation.navigate('WriteSummary', { id: id, topicId: topicId, type: 'submit', summaryTitle: str, onGoBack: () => this.getData() });
        break;
        case 'editSummary':
        this.props.navigation.navigate('WriteSummary', { id: id, topicId: topicId, type: 'edit', summaryTitle: str, onGoBack: () => this.getData() });
        break;
      }
    }

    printPastMeetings = () => {
      console.log("Past Meetings: " + JSON.stringify(this.state.pastMeetings));
      if (this.state.pastMeetings[0] !== undefined) {
        return (<View>
          <View style={styles.meetingsGroup}>
            <Text style={styles.meetingsTitle}>Past</Text>
          </View>
          { this.state.pastMeetings.map((m, i) => {
            return (<View key={i} style={styles.meeting}>
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
                onPress={() => this.handlePress(m.buttonPress, m.Id, m.TopicId, m.summaryTitle)}
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
      console.log("Upcoming Meetings: " + JSON.stringify(this.state.upcomingMeetings));
      if (this.state.upcomingMeetings[0] !== undefined) {
        return (<View>
          <View style={styles.meetingsGroup}>
            <Text style={styles.meetingsTitle}>Upcoming</Text>
          </View>
          { this.state.upcomingMeetings.map((m, i) => {
            return (<View key={i} style={styles.meeting}>
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
          </View>
          <Text style={styles.meetingsPrimaryNone}>No scheduled meetings!</Text>
        </View>);
      }

    }

    render () {
      return (<View style={{flex:1}} key={this.state.refreshing}>
      <TitleBar
          title="Meetings"
          navFunction={() => this.props.navigation.navigate('SettingsModal')}
          navigation={this.props.navigation} />
      <ScrollView contentContainerStyle={styles.scrollView}
                  refreshControl={
                      <RefreshControl refreshing={this.state.refreshControl} onRefresh={this.onRefresh.bind(this)} />
                    }>
      { this.printUpcomingMeetings() }
      { this.printPastMeetings() }
      </ScrollView>
      </View>);
    }
}
*/
