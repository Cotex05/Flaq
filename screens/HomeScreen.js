import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity, Text, AppState, Alert } from 'react-native';
import CustomListItem from '../Components/CustomListItem';
import { Avatar, Icon } from 'react-native-elements';
import { StatusBar } from 'expo-status-bar';
import { auth, db } from '../firebase';
import { useIsFocused } from '@react-navigation/native';
import { MD5 } from 'crypto-js';

const HomeScreen = ({ navigation }) => {

    const isFocused = useIsFocused();
    const [appState, setAppState] = useState(AppState.currentState);

    const [chats, setChats] = useState([]);

    const currentUserEmail = auth.currentUser?.email;

    const signOutUser = () => {
        setAppState("inactive");
        db.collection("onlineUsers").doc(auth.currentUser?.email).set({
            online: appState,
        }).then(() => {
            console.log("logout!");
            auth.signOut().then(() => {
                navigation.replace('Login');
            });
        })
    }

    useEffect(() => {
        AppState.addEventListener('change', handleAppStateChange);
        db.collection("onlineUsers").doc(currentUserEmail).set({
            online: appState,
        });
        return () => {
            AppState.removeEventListener('change', handleAppStateChange);
        };
    }, [appState]);

    const handleAppStateChange = (nextAppState) => {
        // console.log('App State: ' + nextAppState);
        if (appState != nextAppState) {
            if (appState.match(/inactive|background/) && nextAppState === 'active') {
                // console.log(
                //   'App State: ' +
                //   'App has come to the foreground!'
                // );
                // console.log(
                //   'App State: ' +
                //   'App has come to the foreground!'
                // );
            }
            //   console.log('App State: ' + nextAppState);
            setAppState(nextAppState);
        }
    };

    useEffect(() => {
        const unsubscribe = db.collection('userChats').doc(auth.currentUser?.email).collection('chat').orderBy("timestamp").onSnapshot(snapshot =>
            setChats(snapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data(),
            }))
            )
        );
        return unsubscribe;
    }, [isFocused]);

    useLayoutEffect(() => {

        const userProfilePhoto = auth.currentUser?.photoURL;

        navigation.setOptions({
            title: "Flaq",
            headerTitleStyle: { fontWeight: 'bold', letterSpacing: 2, fontFamily: 'serif' },
            headerLeft: () => (
                <View style={{ marginHorizontal: 15 }}>
                    <TouchableOpacity onPress={signOutUser}>
                        <Icon
                            name='log-out'
                            type='ionicon'
                            color='#fff'
                            size={30}
                        />
                    </TouchableOpacity>
                </View>
            ),
            headerRight: () => (
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 10
                }}>
                    <TouchableOpacity style={{ marginHorizontal: 5, }} onPress={() => navigation.navigate("Profile")}>
                        <Avatar containerStyle={{ borderColor: '#fff', borderWidth: 1, backgroundColor: '#000' }} rounded source={{ uri: userProfilePhoto }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginHorizontal: 5 }} onPress={() => navigation.navigate("AddChat")}>
                        <Icon name="chat-plus" type="material-community" size={30} color="#fff" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, isFocused]);

    const enterChat = async (id, chatName, profileImage, email) => {
        navigation.navigate("Chat", {
            id,
            chatName,
            profileImage,
            email,
        });

        let emailGibberish = email + auth.currentUser?.email;
        emailGibberish = JSON.stringify(emailGibberish).split('').sort().join('');
        var emailHash = MD5(emailGibberish).toString();

        const snapshot = await db.collection("User-Chats-Contents").doc(email).collection('chatContents').doc(emailHash).collection('messages').get();
        snapshot.docs.forEach((doc) => {
            doc.ref.update({
                seen: true
            })
        });
    };

    return (
        <SafeAreaView>
            <StatusBar style="light" />
            <ScrollView style={styles.container}>
                {chats.slice(0).reverse().map(({ id, data: { chatName, profileImage, email } }) => (
                    <CustomListItem
                        key={id}
                        id={id}
                        chatName={chatName}
                        enterChat={enterChat}
                        profileImage={profileImage}
                        email={email}
                    />
                ))}
                <View>
                    <TouchableOpacity onPress={() => navigation.navigate('AddChat')}>
                        <Text style={{ color: 'grey', fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace', alignSelf: 'center', padding: 16 }}>Add New Chat</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        height: "100%",
    }
})
