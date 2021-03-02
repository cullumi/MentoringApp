



import React from 'react';
import { Linking, View, TouchableOpacity, Text, Button, Image, AsyncStorage} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {BackTitleBarContact} from './ScreenComponents.js';
import {styles, colors} from './Styles.js';
import {getContactInfoOf} from './API.js';
import * as Contacts from 'expo-contacts';

export default class ContactInfoScreen extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        refreshing : true,
        contactInfo : []
      };
    }

    componentDidMount() {
      if (this.state.refreshing) {
        this.setContactInfo()
      }
    }

    async setContactInfo() {

      console.log("setting contact info...");

      var newCI = [];
      var doSetAsyncStorage = false;
      const userID = this.props.route.params.user.Id;
      // console.warn(userID);

      console.log('uid: ' + userID);

      try {
        newCI = await getContactInfoOf(userID);
        doSetAsyncStorage = true;

      } catch (error) {
        console.log(error);
        try {
          var tempCI = JSON.parse(await AsyncStorage.getItem('ContactInfo/' + userID));
          if (tempCI != null && Array.isArray(tempCI)) {
            newCI = tempCI;
          }
        } catch (error) {
          console.log(error);
        }
      }

      // Save mentor/mentee info from the database into local storage, for when you're offline.
      if (doSetAsyncStorage) {
        try {
          await AsyncStorage.setItem('ContactInfo/' + userID, JSON.stringify(newCI));
        } catch (error) {
          console.log(error);
        }
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

      this.setState({refreshing: false, contactInfo: newCI});
    }

    async openContactPicker() {

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
        var ci = this.state.contactInfo;
        const user = this.props.route.params.user;
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

    };

    infoItem(info) {
      if (info.ContactType == 'Email') {
        return (<View>
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:' + info.ContactValue)}>
            <View style={styles.contactIconContainer}>
              <IonIcon type='Ionicons' name={info.ContactIcon} size={30} color={colors.vikingBlue} />
            </View>
            <View style={styles.contactRowText}>
              <Text style={styles.contactRowType}>{ info.ContactType }</Text>
              <Text style={styles.contactRowValue}>{ info.ContactValue }</Text>
            </View>
          </TouchableOpacity>
        </View>);
      } else {
        return (<View>
          <TouchableOpacity style={styles.contactRow} onPress={() => this.openContactPicker()}>
            <View style={styles.contactIconContainer}>
              <IonIcon type='Ionicons' name={info.ContactIcon} size={30} color={colors.vikingBlue} />
            </View>
            <View style={styles.contactRowText}>
              <Text style={styles.contactRowType}>{ info.ContactType }</Text>
              <Text style={styles.contactRowValue}>{ info.ContactValue }</Text>
            </View>
          </TouchableOpacity>
        </View>);
      }
    }

    displayCI(cInfo) {

      const user = this.props.route.params.user;
      const type = this.props.route.params.type;

      return(
        <View style={styles.contactContainer}>
            <View style={{flexGrow: 1}}>
                <Image style={styles.contactAvatar} source={{uri: user.Avatar}} />
                <Text style={styles.contactName}>{ user.FirstName + " " + user.LastName }</Text>
                <View style={user.homeBoxStyle}>
                  <Text style={styles.contactTag}>{ type } </Text>
                </View>
            </View>
            <View style={styles.contactText}>
                { console.log(JSON.stringify(cInfo)) }
                { cInfo.map( (info) => {
                    return this.infoItem(info);
                })}
            </View>
            <Button
              title="Propose Meeting"
              containerStyle={user.contactButtonStyle}
              style={styles.summaryButtonText}
              onPress={() => this.props.navigation.navigate('ProposeMeeting', { user: user, type: type })}
              disabled={user.contactButtonStatus}/>
        </View>
      );
    }

    render() {

      console.log("Rendering Contact Info Screen...");

      return (
        <View style={{flex: 1, flexDirection: 'column', backgroundColor:'#fff'}}>
          <BackTitleBarContact title="Contact Info" navigation={this.props.navigation} />
          { this.displayCI(this.state.contactInfo) }
        </View>
      );
    }
}