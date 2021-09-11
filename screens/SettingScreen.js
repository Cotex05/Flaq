import React from 'react';
import { StyleSheet, Text, View, ScrollView, Share, TouchableHighlight, Alert } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import { auth, db } from "../firebase";

const SettingScreen = ({ navigation }) => {

    const signOutUser = () => {
        navigation.navigate('Home');
        db.collection("onlineUsers").doc(auth.currentUser?.email).set({
            online: "inactive",
        });
        auth.signOut().then(() => {
            navigation.replace('Login');
        });
    };

    const onShare = async () => {
        try {
            const link = "https://play.google.com/store/apps/details?id=com.Cotex.flaq";
            const result = await Share.share({
                message: `Hi, I am inviting you to join flaq - "A messaging app \n". ${link}`,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            Alert.alert("Error!", error.message);
        }
    };

    return (
        <ScrollView style={{ backgroundColor: '#002446' }}>
            <View>
                <View>
                    <ListItem containerStyle={{ backgroundColor: '#111' }} bottomDivider>
                        <Icon name="lock" color="#fff" />
                        <ListItem.Content>
                            <ListItem.Title style={{ color: '#fff' }}>Security</ListItem.Title>
                        </ListItem.Content>
                        <ListItem.Chevron />
                    </ListItem>
                    <ListItem containerStyle={{ backgroundColor: '#111' }} bottomDivider>
                        <Icon name="shield" color="#fff" />
                        <ListItem.Content>
                            <ListItem.Title style={{ color: '#fff' }}>Privacy</ListItem.Title>
                        </ListItem.Content>
                        <ListItem.Chevron />
                    </ListItem>
                    <TouchableHighlight onPress={onShare}>
                        <ListItem containerStyle={{ backgroundColor: '#111' }} bottomDivider>
                            <Icon name="users" type="font-awesome-5" color="#fff" />
                            <ListItem.Content>
                                <ListItem.Title style={{ color: '#fff' }}>Invite Others</ListItem.Title>
                            </ListItem.Content>
                            <ListItem.Chevron />
                        </ListItem>
                    </TouchableHighlight>
                    <ListItem onPress={signOutUser} containerStyle={{ backgroundColor: '#111' }} bottomDivider>
                        <Icon name="logout" color="#fff" />
                        <ListItem.Content>
                            <ListItem.Title style={{ color: 'red' }}>Logout</ListItem.Title>
                        </ListItem.Content>
                        <ListItem.Chevron />
                    </ListItem>
                </View>
            </View>
        </ScrollView>
    )
}

export default SettingScreen;

const styles = StyleSheet.create({})
