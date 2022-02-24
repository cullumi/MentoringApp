




import React, { useState, useEffect } from 'react';
import {View, Text, Image, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Button from 'react-native-button';
import {BackTitleBarHelp, UnifiedTitleBar} from './ScreenComponents.js';
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
      <UnifiedTitleBar title="Settings" typeLeft='back' typeRight='help'/> 
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