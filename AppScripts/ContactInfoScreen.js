



import React, { useState, useEffect } from 'react'
import * as Contacts from 'expo-contacts'
import * as Linking from 'expo-linking';
import { Alert, View, TouchableOpacity, Text, Image } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from 'react-native-button'
import IonIcon from 'react-native-vector-icons/Ionicons';
import { UnifiedTitleBar } from './ScreenComponents.js';
import { styles, colors } from './Styles.js';
import { getCurrentUser, getContactInfoOf, createMeeting } from './API.js';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getLocalUser, loadLocalArray, saveLocal } from './globals.js';


export default function ContactInfoScreen() {
  const [refreshing, setRefreshing] = useState(true);
  const [contactInfo, setContactInfo] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  const componentDidMount = () => {
    if (refreshing) {
      updateContactInfo()
    }
  };

  const updateContactInfo = async () => {
    console.log("setting contact info...");
    var newCI = [];
    var doSetAsyncStorage = false;
    const userID = route.params.user.Id;
    // console.warn(userID);
    console.log('uid: ' + userID);
    try {
      newCI = await getContactInfoOf(userID);
      doSetAsyncStorage = true;
    } catch (error) {
      console.log(error);
      newCI = await loadLocalArray('ContactInfo/' + userID, newCI);
    }
    // Save mentor/mentee info from the database into local storage, for when you're offline.
    if (doSetAsyncStorage) {
      await saveLocal('ContactInfo/' + userID, newCI);
    }
    newCI.map( (info) => {
        switch(info.ContactType) {
          case 'Email':
            info.ContactIcon = 'ios-mail';
            break;
          case 'Phone':
            info.ContactIcon = 'ios-phone-portrait';
            break;
        }
    })
    setRefreshing(false);
    setContactInfo(newCI);
  }

  const openContactInfoPicker = async () => {

    const { status } = await Contacts.requestPermissionsAsync();

    if (status == 'granted') {
      
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      if (data.length > 0) {
        const contact = data[1];
        console.log(contact);
      }
      if (data.length > 0) {
        const contact = data[0];
        console.log(contact);
      }

      var ci = contactInfo;
      const user = route.params.user;
      var givenName = user.FirstName;
      var familyName = user.LastName;
      var email = '';
      var phone = '';

      ci.map((info) => {
        switch(info.ContactType) {
          case 'Email':
          email = info.ContactValue;
          break;
          case 'Phone':
          phone = info.ContactValue;
          break;
        }
      });

      phone.replace("(","");
      phone.replace(")","");
      phone.replace("-","");
      phone.replace(" ","");
      phone = '+1' + phone;
      
      const contact = {
        [Contacts.Fields.FirstName]: givenName,
        [Contacts.Fields.LastName]: familyName,
        [Contacts.Fields.PhoneNumbers]: [{digits:phone,number:phone,countryCode:'us'}],
        [Contacts.Fields.Emails]: [{email:email}],
      };
      const contactId = await Contacts.addContactAsync(contact);
      await Contacts.presentFormAsync(contactId);
    }

  }

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const handleConfirm = async (date) => {
    var user = await getLocalUser('CInfo - ProposeMeeting');
    console.log(route.params.user.Id, user);
    await createMeeting(route.params.user.Id, user.Id, date);
    console.log("Done creating meeting.");
    hideModal();
    navigation.navigate('Meetings');
  };

  const onSelectContactInfo = () => {
    if (info.ContactType == 'Email') {
      Linking.openURL('mailto:' + info.ContactValue);
    } else {
      openContactInfoPicker();
    }
  }

  const infoItem = (info, i) => {
    return (
      <View key={i}>
        <TouchableOpacity style={styles.contactRow} onPress={ () => {onSelectContactInfo();} }>
          <View style={styles.contactIconContainer}>
            <IonIcon type='Ionicons' name={info.ContactIcon} size={30} color={colors.vikingBlue} />
          </View>
          <View style={styles.contactRowText}>
            <Text style={styles.contactRowType}>{ info.ContactType }</Text>
            <Text style={styles.contactRowValue}>{ info.ContactValue }</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  const displayCI = (cInfo) => {
    const user = route.params.user;
    const type = route.params.type;
    return(
      <View style={styles.contactContainer}>
        <View style={{marginBottom:15, flexGrow:1}}>
          <Image style={styles.contactAvatar} source={{uri: user.Avatar}} />
          <Text style={styles.contactName}>{ user.FirstName + " " + user.LastName }</Text>
          <View style={user.homeBoxStyle}>
            <Text style={styles.contactTag}>{ type } </Text>
          </View>
        </View>
        <Button
            containerStyle={user.contactButtonStyle}
            style={styles.proposeMeetingButtonText}
            minimumDate={new Date(2021, 12, 12)}
            onPress={() => showModal()}
            disabled={user.proposeMeetingButtonStatus}>
          Propose Meeting
        </Button>
        <View style={styles.contactInfoList}>
          { console.log(JSON.stringify(cInfo)) }
          { cInfo.map( (info, i) => { return infoItem(info, i); }) }
        </View>
      </View>
    );
  }

  useEffect(() => {
    console.log("Rendering Contact Info Screen...");
    componentDidMount();
  }, []);
  
  return (
    <View style={{flex: 1, flexDirection: 'column', backgroundColor:'#fff'}}>
      <UnifiedTitleBar title="Contact Info" typeLeft='back' />
      { displayCI(contactInfo) }
      <DateTimePickerModal style={styles.dateTimeBox}
          isVisible={modalVisible}
          mode="datetime"
          onConfirm={(date) => handleConfirm(date)}
          onCancel={() => hideModal()}
        />
    </View>
  );
}