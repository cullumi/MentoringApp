




import React, { useEffect, useState } from 'react';
import {View, Text, ScrollView, RefreshControl} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {TitleBar} from './ScreenComponents.js';
import {styles, colors} from './Styles.js';
import {getAllTopics, getCurrentTopic} from './API.js';


export default function TopicsScreen() {

  const [shouldUpdate, setShouldUpdate] = useState(true);
  const [topics, setTopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [refreshControl, setRefreshControl] = useState(true);
  const navigation = useNavigation();

  const getData = async () => {
    var newTopics = [];
    var newCurrentTopic = null;
    var doSetAsyncStorage = false;

    try {
      newTopics = await getAllTopics();
      newCurrentTopic = await getCurrentTopic();
      doSetAsyncStorage = true;
    } catch (error) {
      console.log(error);
      try {
        const tempTopics = JSON.parse(await AsyncStorage.getItem('Topics'));
        const tempCurrentTopic = JSON.parse(await AsyncStorage.getItem('CurrentTopic'));
        if (tempTopics != null && Array.isArray(tempMentors)) {
          newTopics = tempTopics;
        }
        if (tempCurrentTopic != null) {
          newCurrentTopic = tempCurrentTopic;
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (doSetAsyncStorage) {
      try {
        await AsyncStorage.setItem('Topics', JSON.stringify(newTopics));
        await AsyncStorage.setItem('CurrentTopic', JSON.stringify(newCurrentTopic));
      } catch (error) {
        console.log(error);
      }
    }

    setShouldUpdate(false);
    setTopics(newTopics);
    setCurrentTopic(newCurrentTopic);
    setRefreshControl(false);
  }

  const topicItem = (topic, i=0) => {
    // console.log('Topic Item:', topic);
    return (
      <View key={i} style={styles.topicContainer}>
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

  // May need to be modified
  const onRefresh = () => {
    setRefreshControl(true);
    getData();
  }

  useEffect(() => {
    getData();
  }, [])

  return (
    <View style={{flex: 1, flexDirection: 'column'}}>
      <TitleBar 
          title="Topics" 
          navFunction={() => navigation.navigate('SettingsModal')}
          navigation={navigation} />
      <ScrollView
        refreshControl={
            <RefreshControl refreshing={refreshControl} onRefresh={onRefresh.bind(this)} />
          }>
        <View style={styles.meetingsGroup}>
          <Text style={styles.meetingsTitle}>Current Topic</Text>
        </View>
        {
          currentTopic != null ? topicItem(currentTopic) : <View/>
        }
        <View style={styles.meetingsGroup}>
          <Text style={styles.meetingsTitle}>All Topics</Text>
        </View>
        {
          topics.map( (topic, i) => {
            return topicItem(topic, i);
          })
        }
      </ScrollView>
    </View>
  );
}


/*
// Topic Screen -- for displaying a list of all current and past monthly topics.
export default class TopicsScreen extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        shouldUpdate: true,
        topics: [],
        currentTopic: null,
        refreshControl: true
      };
    }
  
    async setTopics() {
      var newTopics = [];
      var newCurrentTopic = null;
      var doSetAsyncStorage = false;
  
      try {
        newTopics = await getAllTopics();
        newCurrentTopic = await getCurrentTopic();
        doSetAsyncStorage = true;
      } catch (error) {
        console.log(error);
        try {
          const tempTopics = JSON.parse(await AsyncStorage.getItem('Topics'));
          const tempCurrentTopic = JSON.parse(await AsyncStorage.getItem('CurrentTopic'));
          if (tempTopics != null && Array.isArray(tempMentors)) {
            newTopics = tempTopics;
          }
          if (tempCurrentTopic != null) {
            newCurrentTopic = tempCurrentTopic;
          }
        } catch (error) {
          console.log(error);
        }
      }
  
      if (doSetAsyncStorage) {
        try {
          await AsyncStorage.setItem('Topics', JSON.stringify(newTopics));
          await AsyncStorage.setItem('CurrentTopic', JSON.stringify(newCurrentTopic));
        } catch (error) {
          console.log(error);
        }
      }
  
      this.setState({refreshControl:false, shouldUpdate: false, topics: newTopics, currentTopic: newCurrentTopic});
    }
  
    topicItem(topic, i=0) {
  
      return (
        <View key={i} style={styles.topicContainer}>
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
  
    onRefresh() {
      this.setState({refreshControl:true});
      this.setTopics();
    }
  
    render () {
  
      if (this.state.shouldUpdate) {
        this.setTopics();
      }
    }
}
*/