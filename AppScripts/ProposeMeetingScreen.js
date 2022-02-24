



import React from 'react';
import {View, Text, Image, AsyncStorage} from 'react-native';
import Button from 'react-native-button';
import {BackTitleBar, SettingsModal} from './ScreenComponents.js';
import {styles, colors} from './Styles.js';
import {getContactInfoOf} from './API.js';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default class ProposeMeetingScreen extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        refreshing : true,
        modalVisible : false
      }
    }

    showModal() {
      this.setState({modalVisible:true});
    };

    hideModal() {
      this.setState({modalVisible:false});
    };

    handleConfirm(date) {
      console.log("Date picked wawa: " + date);
      this.hideModal();
      this.props.navigation.navigate('Meetings');
    };

    render() {

      console.log("Rendering Propose Meeting Screen...");

      return (
        <View style={styles.contactContainer}>
        <Text style={styles.contactName}>
          Select a meeting date and time:
        </Text>
        <View style={styles.dateTimeWrapper}>
          <View style={styles.dateTimeBox}>
            <DateTimePickerModal style={styles.dateTimeBox}
              isVisible={this.state.modalVisible}
              mode="datetime"
              onConfirm={() => his.handleConfirm()}
              onCancel={() => this.hideModal()}
            />
          </View>
        </View>
        <Button
          containerStyle={styles.summaryButton}
          style={styles.summaryButtonText}
          onPress={() => this.showModal()}>
          Choose
        </Button>
        </View>
      );
    }
}
