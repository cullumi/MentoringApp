



import React, {useEffect} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {colors, mainTitleWidth} from './Styles.js';
import { useNavigation } from '@react-navigation/native';

export function TrashCan(props) {
  const navigation = useNavigation();
  var onPress = props.onPress;
  
  useEffect(() => {
    onPress = props.onPress
  }, [props.onPress]);

  return (
    <TouchableOpacity style={{width:30, marginRight:15}} onPress={onPress} activeOpacity={0.5}>
        <IonIcon name="ios-trash" size={30} color={colors.red} />
    </TouchableOpacity>
  )
}

export function SettingsModal(props) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={{width:30, marginRight:15}} onPress={() => navigation.navigate('SettingsModal')} activeOpacity={0.5}>
        <IonIcon name="ios-settings" size={30} color={colors.vikingBlue} />
    </TouchableOpacity>
  );
}

export function BackButton(props) {
  const navigation = useNavigation()
  return (
    <TouchableOpacity style={{marginLeft:15, justifyContent:'center', width:30}}
                      onPress={() => navigation.goBack()} activeOpacity={0.5}>
        <IonIcon type='Ionicons' name='ios-arrow-back' size={30} color={colors.vikingBlue} />
    </TouchableOpacity>
  );
}

export function HelpModal(props) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={{width:30, justifyContent:'center'}} 
            onPress={() => navigation.navigate('HelpModal')} activeOpacity={0.5}>
      <IonIcon name="ios-help-circle" size={30} color={colors.vikingBlue} />
    </TouchableOpacity>
  );
}

export function UnifiedTitleBar(props) {
  
  var navigation = useNavigation();
  var title = props.title;
  var typeLeft = props.typeLeft
  var typeRight = props.typeRight;
  var onPressLeft = props.onPressLeft;
  var onPressRight = props.onPressRight;
  var navFunction = props.navFunction;
  
  const titleBarRight = (type) => {
    switch (type) {
      case 'settings': return(<SettingsModal />);
      case 'help': return(<HelpModal />);
      case 'trash': return(<TrashCan onPress={onPressRight} />)
      default: return(<View style={{width:30, margineRight:15}} />);
    }
  }
  
  const titleBarLeft = (type) => {
    switch (type) {
      case 'back': return (<BackButton />);
      default: return(<View style={{width:30, marginLeft:15}} />);
    }
  }

  useEffect(() => {
    title = props.title;
    typeLeft = props.typeLeft;
    typeRight = props.typeRight;
    onPressLeft = props.onPressLeft;
    onPressRight = props.onPressRight;
  }, [props.title, props.typeLeft, props.typeRight, props.onPressLeft, props.onPressRight]);

  return (
    <View key={title}>
      <View style={{height:25, backgroundColor: colors.vikingBlue}}></View>
      <View style={{height:30, backgroundColor: colors.white}}></View>
      <View style={{flexDirection:'row', backgroundColor: colors.white, alignItems:'center'}}>
        {titleBarLeft(typeLeft)}
        <View style={{width:mainTitleWidth,textAlign:'center',alignItems:'center'}}>
          <Text style={{fontSize:22,textAlign:'center'}}>{title}</Text>
        </View>
        {titleBarRight(typeRight)}
      </View>
      <View style={{height:30, backgroundColor: colors.white}}></View>
    </View>
  );
}