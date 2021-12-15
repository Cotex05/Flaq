import React, { useLayoutEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, Keyboard, ToastAndroid, Share } from 'react-native';
import { Button, Input, Icon, ListItem, Avatar } from 'react-native-elements';
import { auth, db } from '../firebase';
import { MD5 } from 'crypto-js';
import * as firebase from 'firebase';

const Addchat = ({ navigation }) => {

    const [input, setInput] = useState("");
    const [profileImage, setProfileImage] = useState("https://i.imgur.com/qlBdn0Q.png");
    const [name, setName] = useState("");
    const [status, setStatus] = useState("");
    const [email, setEmail] = useState("");
    const [dispUser, setDispUser] = useState("none");

    let emailGibberish = email + auth.currentUser.email;
    emailGibberish = JSON.stringify(emailGibberish).split('').sort().join('');
    var emailHash = MD5(emailGibberish).toString();

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Add a new Chat",
        });
    }, [navigation]);

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

    const searchUser = async () => {
        const searchKey = input.toLocaleLowerCase();
        if (searchKey.trim().length === 0) {
            ToastAndroid.showWithGravity(
                "Search text is empty!",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
            Keyboard.dismiss();
            setInput("");
            return;
        }
        if (searchKey === auth.currentUser?.email) {
            ToastAndroid.showWithGravity(
                "You are searching yourself!",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
            Keyboard.dismiss();
            setInput("");
            return;
        }
        const snapshot = await db.collection('user').where('email', '==', searchKey).get();
        if (!snapshot.empty) {
            snapshot.forEach(profile => {
                if (profile.data().email === searchKey.toLocaleLowerCase()) {
                    // console.log(profile.data().email);
                    setEmail(profile.data().email);
                    setName(profile.data().username);
                    setProfileImage(profile.data().profileImage);
                    setStatus(profile.data().about);
                    setDispUser('flex');
                }
            });
        } else {
            Alert.alert(
                "User Not Found",
                `Search for "${searchKey}" is not found!`,
                [
                    {
                        text: "Invite Now",
                        onPress: () => onShare(),
                    },
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                ]
            );
        }
        Keyboard.dismiss();
        setInput("");
    };

    const addChatToHome = async () => {
        const snapshot = await db.collection("userChats").doc(auth.currentUser?.email).collection('chat').where("email", "==", email).get();
        if (snapshot.empty) {
            db.collection('userChats')
                .doc(auth.currentUser?.email)
                .collection('chat').doc(emailHash)
                .set({
                    chatName: name,
                    email: email,
                    profileImage: profileImage,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    navigation.goBack();
                    ToastAndroid.showWithGravity(
                        `${name}'s added to your chats!`,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                })
                .catch((error) => Alert.alert(error));
        } else {
            Alert.alert("User's chat exists!",
                `"${name}" is already present in your current chats.`,
                [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]
            );
        }
    }

    return (
        <View style={styles.container}>
            <Input
                placeholder="Enter User's Email"
                autoCorrect={false}
                keyboardType="email-address"
                value={input}
                onChangeText={text => setInput(text)}
                onSubmitEditing={searchUser}
                maxLength={50}
                leftIcon={
                    <Icon name="search" size={25} />
                }
            />
            <Button onPress={searchUser} title="Search" />
            <View style={{ display: dispUser }}>
                <View style={styles.userView}>
                    <ListItem containerStyle={{ backgroundColor: '#efefef', marginTop: -5 }} bottomDivider>
                        <Avatar
                            rounded
                            size={60}
                            source={{
                                uri: profileImage
                            }}
                            containerStyle={{ borderWidth: 1, borderColor: '#000', marginLeft: -12 }}
                        />
                        <ListItem.Content>
                            <ListItem.Title style={{ fontWeight: 'bold' }}>
                                {name}
                            </ListItem.Title>
                            <ListItem.Subtitle numberOfLines={2} ellipsizeMode="tail">
                                {status}
                            </ListItem.Subtitle>
                        </ListItem.Content>
                    </ListItem>
                    <View>
                        <Text style={{ fontFamily: 'monospace', color: 'grey', marginTop: 5, fontWeight: 'bold' }}>{email}</Text>
                    </View>
                    <TouchableOpacity onPress={addChatToHome} style={{ alignSelf: 'flex-end', justifyContent: 'center', position: 'absolute', bottom: -20, right: -20 }}>
                        <Icon
                            reverse
                            name="person-add"
                            type="ionicon"
                            size={25}
                            color="#007fff"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default Addchat;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "ghostwhite",
        padding: 30,
        height: "100%"
    },
    userView: {
        borderRadius: 10,
        borderColor: 'grey',
        borderWidth: 1,
        marginTop: 40,
        padding: 8,
        shadowColor: '#000',
        shadowRadius: 50,
        backgroundColor: '#efefef',
    }
})
