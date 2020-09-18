import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text, Button, View, ActivityIndicator, StatusBar } from 'react-native';
import LinkedInModal, { LinkedInToken } from 'react-native-linkedin';

const Stack = createStackNavigator();

const [isSignedIn, setIsSignedIn] = useState(false);

export default function App() {
  return isSignedIn ? (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Welcome' }}
        />
        <Stack.Screen name="Meetings" component={MeetingsScreen} />
        <Stack.Screen name="ViewDebrief" component={ViewDebriefScreen} />
        <Stack.Screen name="Messaging" component={MessagingScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="SubmitDebrief" component={SubmitDebriefScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  ) : (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Welcome!' }}
        />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const HomeScreen = ({ navigation }) => {
  return (
    <Button
      title="Go to Jane's profile"
      onPress={() =>
        navigation.navigate('Profile', { name: 'Jane' })
      }
    />
  );
};

const MeetingsScreen = () => {
  return <Text></Text>;
};

const ViewDebriefScreen = () => {
  return <Text></Text>;
};

const MessagingScreen = () => {
  return <Text></Text>;
};

const HelpScreen = () => {
  return <Text></Text>;
};

const SubmitDebriefScreen = () => {
  return <Text></Text>;
};

const linkedRef = React.createRef<LinkedInModal>();

const LoginScreen = () => {
  return (
      <View style={styles.container}>
        <LinkedInModal
          ref={linkedRef}
          clientID="[ Your client id from https://www.linkedin.com/developer/apps ]"
          clientSecret="[ Your client secret from https://www.linkedin.com/developer/apps ]"
          redirectUri="[ Your redirect uri set into https://www.linkedin.com/developer/apps ]"
          onSuccess={token => console.log(token)}
        />
        <Button title="Log Out" onPress={this.linkedRef.current.logoutAsync()} />
      </View>
    );
};

const Screen = () => {
  return <Text></Text>;
};
