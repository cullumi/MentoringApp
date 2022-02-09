




import React, { useState, useEffect } from 'react';
import {View, Text, Image, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Button from 'react-native-button';
import {BackTitleBarHelp} from './ScreenComponents.js';
import {styles, colors} from './Styles.js';
import {getLocalUser} from './globals.js';

export default function SettingsScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState({})
  const navigation = useNavigation();

  logout = () => {
    AsyncStorage.clear();
    navigation.navigate('Login');
  };

  const getUser = async () => {
    setUser(getLocalUser('SettingsScreen'));
  };

  const componentDidMount = () => {
    getUser();
  };

  useEffect(() => {
    componentDidMount();
  }, []);

  return (
    <View>
      <BackTitleBarHelp title="Settings"/> 
      <ScrollView style={styles.scrollView}>
        <View style={{justifyContent: 'center',
        alignItems: 'center',paddingTop:25}}>
          <Image style={styles.bigAvatar} source={{uri: user.avatar}} />
          <Text style={styles.settingsName}>{user.firstName} {user.lastName}</Text>
          <Button
            containerStyle={styles.logoutButton}
            style={{fontSize: 16, color: 'white'}}
            onPress={() => logout()} >
              Log Out
          </Button>
          <Button
            containerStyle={styles.updatePrivacyButton}
            style={styles.summaryButtonText}
            onPress={() => navigation.navigate('Privacy')}>
              Update Privacy
          </Button>
          <Text>
            <Text style={styles.basePrivacyText}>MentoringApp v1.0</Text>
          </Text>
          <View style={{height:15}} />
        </View>
      </ScrollView>
    </View>
  );
}

/*
export default class SettingsScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        refreshing: false,
        user: []
      }
    }
  
    logout = () => {
      AsyncStorage.clear();
      this.props.navigation.navigate('Login');
    }
  
    async getUser() {
      const u = JSON.parse(await AsyncStorage.getItem('User'));
      this.setState({user:u});
    }
  
    componentDidMount() {
      this.getUser();
    }
  
    render () {
  
      return <View>
        <BackTitleBarHelp 
            title="Settings" 
            navFunction={() => this.props.navigation.navigate('HelpModal')} 
            navigation={this.props.navigation} />
        <ScrollView style={styles.scrollView}>
          <View style={{justifyContent: 'center',
          alignItems: 'center',paddingTop:25}}>
            <Image style={styles.bigAvatar} source={{uri: this.state.user.avatar}} />
            <Text style={styles.settingsName}>{this.state.user.firstName} {this.state.user.lastName}</Text>
            <Button
              containerStyle={styles.logoutButton}
              style={{fontSize: 16, color: 'white'}}
              onPress={() => this.logout()} >
                Log Out
            </Button>
            <Button
              containerStyle={styles.updatePrivacyButton}
              style={styles.summaryButtonText}
              onPress={() => this.props.navigation.navigate('Privacy')}>
                Update Privacy
            </Button>
            <Text>
              <Text style={styles.basePrivacyText}>MentoringApp v1.0</Text>
            </Text>
            <View style={{height:15}} />
          </View>
        </ScrollView>
      </View>
    }
  }
  */