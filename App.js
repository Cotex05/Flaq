import React from 'react';
import { StyleSheet, LogBox } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import AddChat from './screens/AddChat';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import AboutScreen from './screens/AboutScreen';
import SettingScreen from './screens/SettingScreen';
import UserProfileScreen from './screens/UserProfileScreen';

const Stack = createStackNavigator();

const globalScreenOptions = {
  headerStyle: { backgroundColor: '#007fff', },
  headerTitleStyle: { color: 'white' },
  headerTintColor: "white",
}

LogBox.ignoreLogs(['Setting a timer']);

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={globalScreenOptions}>
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='Register' component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name='AddChat' component={AddChat} />
        <Stack.Screen name='Chat' component={ChatScreen} />
        <Stack.Screen name='Profile' component={ProfileScreen} />
        <Stack.Screen name='About' component={AboutScreen} />
        <Stack.Screen name='Settings' component={SettingScreen} />
        <Stack.Screen name='UserProfile' component={UserProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
