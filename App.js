import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text, Button, View, ActivityIndicator, StatusBar } from 'react-native';
import LinkedInModal, { LinkedInToken } from 'react-native-linkedin';

// Main class for app. Responsible for rendering app container.
export default class AppContainer extends React.Component {

  const Stack = createStackNavigator();
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Main rendering function. Detects whether user is signed in, then brings them to Home or Login.
  render() {
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
    )
  }

  // Functions for generating various pages below.

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

  // Create reference to LinkedInModal.
  const linkedRef = React.createRef<LinkedInModal>();

  const LoginScreen = () => {
    return (
        <View style={styles.container}>
          <LinkedInModal
            ref={linkedRef}
            clientID="86bzo41s6bc4am"
            clientSecret="O2U1ANijJnQG2E3s"
            redirectUri="https://cs.wwu.edu/"
            onSuccess={token => console.log(token)}
          />
          <Button title="Log Out" onPress={this.linkedRef.current.logoutAsync()} />
        </View>
      );
  };

  const Screen = () => {
    return <Text></Text>;
  };

};
