import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, ToastAndroid } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import { MD5 } from 'crypto-js';
import { auth, db } from '../firebase';
import { useIsFocused } from '@react-navigation/native';

const CustomListItem = ({ id, chatName, enterChat, profileImage, email }) => {

    const isFocused = useIsFocused();

    const userEmail = auth.currentUser?.email;

    const [lastChat, setLastChat] = useState();
    const [lastChatTime, setLastChatTime] = useState('');

    let emailGibberish = email + userEmail;
    emailGibberish = JSON.stringify(emailGibberish).split('').sort().join('');
    const emailHash = MD5(emailGibberish).toString();

    const deleteChat = async () => {
        const unsubscribe = await db.collection('userChats')
            .doc(auth.currentUser?.email)
            .collection('chat')
            .doc(emailHash)
            .delete()
            .then(async () => {
                const chatHistory = await db.collection("User-Chats-Contents").doc(userEmail).collection('chatContents').doc(emailHash).collection('messages').get();
                chatHistory.docs.forEach((doc) => {
                    doc.ref.delete();
                });

                await db.collection('lastMessages').doc(userEmail).collection(emailHash).doc('lastMessage').set({
                    lastMessage: "Tap to enter the chat",
                    timestamp: ""
                })

                ToastAndroid.showWithGravity(
                    `${chatName}'s Chat deleted!`,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                );
            }).catch((error) => {
                Alert.alert("Error in deleting", error.message);
            })
        return unsubscribe;
    }

    useEffect(() => {
        db.collection('lastMessages')
            .doc(userEmail)
            .collection(emailHash)
            .doc('lastMessage')
            .get()
            .then(snapshot => {
                setLastChat(snapshot?.data()?.lastMessage);
                setLastChatTime(snapshot?.data()?.timestamp == null ? "now" : snapshot?.data()?.timestamp?.toDate());
            }).catch(error => {
                console.log(error);
            });
    }, [isFocused])

    return (
        <ListItem onLongPress={() => Alert.alert("Delete Chat?", `Do you want to delete this chat of ${chatName}? \n\nAll the messages to this chat will also be deleted!`,
            [
                {
                    text: "No",
                    onPress: () => console.log("No Pressed!")
                },
                {
                    text: "Yes",
                    onPress: () => deleteChat()
                }
            ]
        )}
            onPress={() => enterChat(id, chatName, profileImage, email)} key={id}
            bottomDivider
        >
            <Avatar
                rounded
                source={{
                    uri: profileImage != null ? profileImage : "https://i.imgur.com/qlBdn0Q.png"
                }}
                size={50}
                containerStyle={{ backgroundColor: '#000', borderColor: 'grey', borderWidth: 1 }}
            />
            <ListItem.Content>
                <ListItem.Title style={{ fontWeight: 'bold' }}>
                    {chatName}
                </ListItem.Title>
                <ListItem.Subtitle numberOfLines={1} ellipsizeMode="tail">
                    <Text style={{ color: 'grey' }}>{lastChat}</Text>
                </ListItem.Subtitle>
            </ListItem.Content>
            <Text style={{ display: 'none' }}>{email}</Text>
            <Text style={{ color: 'grey', position: 'absolute', right: 10, top: 10, fontSize: 10 }}>
                {lastChatTime != "now" ? lastChatTime.toString().slice(4, 10) : "Now"} {lastChatTime != "now" ? lastChatTime.toString().slice(16, 21) : ""}
            </Text>
        </ListItem>
    )
}

export default CustomListItem;

const styles = StyleSheet.create({})
