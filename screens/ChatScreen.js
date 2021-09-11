import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, SafeAreaView, TouchableOpacity, Dimensions, Modal, ToastAndroid, Image, ImageBackground, Alert, ActivityIndicator, Pressable } from "react-native";
import { Avatar, Icon, Overlay, Button } from "react-native-elements";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { db, auth, storage } from "../firebase";
import * as firebase from "firebase";
import * as Animatable from 'react-native-animatable';
import MD5 from "crypto-js/md5";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

const ChatScreen = ({ navigation, route }) => {

    // States
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [height, setHeight] = useState(50);

    //Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [bgSelectorVisible, setBgSelectorVisible] = useState(false);
    const [chatBg, setChatBg] = useState('https://i.ibb.co/XVL8Svq/Bg1.jpg');

    // User Online State Handle
    const [online, setOnline] = useState(false);

    const [image, setImage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadFromVisible, setUploadFromVisible] = useState(false);
    const [ImageViewVisible, setImageViewVisible] = useState(false);

    var opt = '';

    // User Credentials Variables
    const users_email = route.params.email;
    const users_image = route.params.profileImage;
    const users_name = route.params.chatName;

    // For Chat background Wallpapers
    const bg = [
        'https://i.ibb.co/XVL8Svq/Bg1.jpg',
        'https://i.ibb.co/bQGKLjf/Bg2.jpg',
        'https://i.ibb.co/QQ5rt1B/Bg3.jpg',
        'https://i.ibb.co/tBdqhSD/Bg4.jpg',
        'https://i.ibb.co/hX5q3JS/Bg5.jpg',
        'https://i.ibb.co/Lk16zmL/Bg6.jpg']

    const scrollRef = useRef();

    // Current User Email
    const userEmail = auth.currentUser?.email;

    // Email hash for unique chat records.
    let emailGibberish = route.params.email + userEmail;
    emailGibberish = JSON.stringify(emailGibberish).split('').sort().join('');
    var emailHash = MD5(emailGibberish).toString();

    // Async Storage for storing chat bg image 
    const storeData = async (value) => {
        try {
            await AsyncStorage.setItem('@storage_Key', value)
        } catch (e) {
            // saving error
            console.log(e);
        }
    }

    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('@storage_Key')
            if (value !== null) {
                // value previously stored
                setChatBg(value);
            }
        } catch (e) {
            // error reading value
            console.log(e);
        }
    }

    useEffect(() => {
        const snapshot = db.collection("onlineUsers").doc(route.params.email).get().then(snapshot => {
            if (snapshot?.data()?.online === 'active') {
                setOnline(true);
            } else {
                setOnline(false);
            }
        })
    }, [navigation])

    useEffect(() => {
        getData();
    }, [chatBg])

    const changeChatBg = () => {
        setModalVisible(false);
        setBgSelectorVisible(true);
    }

    const willbeAddedSoon = () => {
        ToastAndroid.showWithGravity(
            "Calling feature will be added soon!",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
        );
    }

    // Top Menu Layout
    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Chat",
            headerStyle: { backgroundColor: "#007fff" },
            headerTintColor: "white",
            headerBackTitleVisible: false,
            headerTitleAlign: "left",
            headerTitle: () => (
                <Pressable onPress={() => navigation.navigate("UserProfile", { users_email, users_image, users_name })}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginLeft: -20 }}>
                        <Avatar
                            rounded
                            size={40}
                            source={{
                                uri: route.params.profileImage != null ? route.params.profileImage : "https://i.imgur.com/qlBdn0Q.png",
                            }}
                            containerStyle={{ backgroundColor: '#000', borderColor: 'ghostwhite', borderWidth: 1 }}
                        />
                        <Text
                            style={{
                                fontWeight: "700",
                                fontSize: 17,
                                color: "white",
                                marginLeft: 5,
                                width: 180
                            }}
                        >
                            {route.params.chatName}
                        </Text>
                        {online ? <Icon
                            containerStyle={{ position: 'absolute', top: 0, left: 30 }}
                            name='circle'
                            color='limegreen'
                            size={16}
                        /> : null}
                    </View>
                </Pressable>
            ),

            headerLeft: () => (
                <TouchableOpacity
                    activeOpacity={0.5}
                    style={{ marginLeft: 12 }}
                    onPress={navigation.goBack}
                >
                    <AntDesign name="leftcircle" color="white" size={25} />
                </TouchableOpacity>
            ),

            headerRight: () => (
                <View
                    style={{
                        flexDirection: "row",
                        width: 100,
                        justifyContent: "flex-end",
                        alignItems: "center",
                        marginRight: 5,
                    }}
                >
                    <TouchableOpacity onPress={willbeAddedSoon} style={{ padding: 5 }}>
                        <FontAwesome name="video-camera" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={willbeAddedSoon} style={{ padding: 2 }}>
                        <Ionicons name="call" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Icon name="dots-vertical" type="material-community" size={28} color="white" />
                    </TouchableOpacity>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            setModalVisible(!modalVisible);
                        }}
                    >
                        <View style={{ flex: 1 }}>
                            <View style={styles.modalView}>
                                <View style={{ width: 100, height: 4, backgroundColor: 'grey', marginBottom: 20, borderRadius: 15, alignSelf: 'center' }}></View>
                                <TouchableOpacity style={styles.modalStyle} onPress={() => { setModalVisible(!modalVisible); navigation.navigate("UserProfile", { users_email, users_image, users_name }) }}>
                                    <Icon
                                        name='user-alt'
                                        type="font-awesome-5"
                                        color='#fff'
                                        size={25}
                                    />
                                    <Text style={styles.modalOptions}>
                                        User Details
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalStyle} onPress={() => setModalVisible(!modalVisible)}>
                                    <Icon
                                        name='search'
                                        type="font-awesome-5"
                                        color='#fff'
                                        size={25}
                                    />
                                    <Text style={styles.modalOptions}>Search</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalStyle} onPress={changeChatBg}>
                                    <Icon
                                        name='image'
                                        type="font-awesome-5"
                                        color='#fff'
                                        size={25}
                                    />
                                    <Text style={styles.modalOptions}>Change Chat Background</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalStyleCancel} onPress={() => setModalVisible(!modalVisible)}>
                                    <Icon
                                        name='cancel'
                                        color='red'
                                        size={25}
                                    />
                                    <Text style={styles.modalOptionCancel}>Close</Text>
                                </TouchableOpacity>
                                <View style={{ height: 100 }}>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            ),
        });
    }, [navigation, messages, modalVisible, bgSelectorVisible]);

    const scrollToBottom = () => {
        scrollRef.current?.scrollToEnd({
            animated: false,
        });
    };

    useEffect(() => {
        setTimeout(() => {
            scrollToBottom();
        }, 100);
    }, [messages]);


    // Functions
    const sendMessage = () => {

        if (input.trim().length !== 0) {
            db.collection("User-Chats-Contents").doc(userEmail).collection("chatContents").doc(emailHash).collection("messages").add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                message: input,
                imageSrc: null,
                displayName: auth.currentUser?.displayName,
                email: auth.currentUser?.email,
                seen: false,
            });
            db.collection("User-Chats-Contents").doc(route.params.email).collection("chatContents").doc(emailHash).collection("messages").add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                message: input,
                imageSrc: null,
                displayName: auth.currentUser?.displayName,
                email: auth.currentUser?.email,
            });
            db.collection('lastMessages').doc(userEmail).collection(emailHash).doc('lastMessage').set({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessage: input,
            });
            db.collection('lastMessages').doc(route.params.email).collection(emailHash).doc('lastMessage').set({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessage: input,
            });
            db.collection('userChats').doc(userEmail).collection('chat').doc(emailHash).update({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });
            db.collection('userChats').doc(route.params.email).collection('chat').doc(emailHash).set({
                chatName: auth.currentUser?.displayName,
                email: userEmail,
                profileImage: auth.currentUser?.photoURL,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });
            Keyboard.dismiss();
        } else {
            ToastAndroid.showWithGravity(
                "Message is Empty!",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
        }
        setInput("");
        setHeight(50);
        scrollToBottom();
    };

    useEffect(() => {
        const unsubscribe = db
            .collection("User-Chats-Contents")
            .doc(userEmail)
            .collection("chatContents")
            .doc(emailHash)
            .collection("messages")
            .orderBy("timestamp")
            .onSnapshot((snapshot) =>
                setMessages(
                    snapshot.docs.map((doc) => ({
                        id: doc.id,
                        data: doc.data(),
                        time: doc.data().timestamp == null ? "now" : doc.data().timestamp.toDate(),
                        seen: doc.data().seen
                    }))
                )
            );
        return unsubscribe;
    }, []);

    // handle functions
    const handleInputHeight = (e) => {
        if (height < 150) {
            setHeight(e.nativeEvent.contentSize.height);
        } else {
            if (e.nativeEvent.contentSize.height < 150) {
                setHeight(e.nativeEvent.contentSize.height);
            } else {
                setHeight(150);
            }
        }
    };

    const askForPermission = async () => {
        const cameraPermissionResult = await Camera.requestPermissionsAsync();
        const imageLibraryPermissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraPermissionResult.granted === false || imageLibraryPermissionResult.granted === false) {
            Alert.alert('Need Permissions!',
                "Please allow the app, to access Camera and Storage.",
                [
                    {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                    },
                    { text: "Ok", onPress: () => askForPermission() }
                ])
            return false;
        }
        return true;
    };

    const selectCameraOption = () => {
        opt = 'camera';
        uploadHandler();
        setUploadFromVisible(false);
    };

    const selectGalleryOption = () => {
        opt = 'gallery';
        uploadHandler();
        setUploadFromVisible(false);
    };

    const UploadFromOptions = () => {
        if (opt === 'camera') {
            return 'camera';
        }
        if (opt === 'gallery') {
            return 'gallery';
        } else {
            return null;
        }
    };

    const uploadHandler = async () => {

        const hasPermission = await askForPermission()
        if (!hasPermission) {
            return;
        } else {
            const option = UploadFromOptions();
            var selector = null;

            //gallery option
            if (option === 'gallery') {
                selector = ImagePicker.launchImageLibraryAsync;
            }
            // camera option
            else if (option === 'camera') {
                selector = ImagePicker.launchCameraAsync;
            }
            else {
                return;
            }
            selector({
                mediaTypes: "Images",
                allowsEditing: true,
                quality: 1,
            }).then((result) => {
                if (!result.cancelled) {
                    // User picked an image
                    const { height, width, type, uri } = result;
                    setImage(uri);
                    setImageViewVisible(true);
                    return uriToBlob(uri);
                } else {
                    return;
                }
            }).then((blob) => {
                if (blob != undefined) {
                    return uploadToFirebase(blob);
                } else {
                    return;
                }
            }).then((snapshot) => {
                if (snapshot != undefined) {
                    setImageViewVisible(false);
                    // console.log("Uploaded Successfully!");
                    ToastAndroid.showWithGravity(
                        "Sent!",
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                } else {
                    setImageViewVisible(false);
                    return;
                }
            }).catch((error) => {
                Alert.alert("An Error Occurred!", error.message);
                return;
            });
        }
    };


    const uriToBlob = (uri) => {

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                // return the blob
                resolve(xhr.response);
            };
            xhr.onerror = function () {
                // something went wrong
                reject(new Error('uriToBlob failed'));
            };
            // this helps us get a blob
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });
    };

    const uploadToFirebase = (blob) => {

        return new Promise((resolve, reject) => {

            var storageRef = storage.ref();
            const date = new Date();
            storageRef.child(`Chats/${emailHash}/` + date + '.jpg').put(blob, {
                contentType: 'image/jpeg'
            }).then((snapshot) => {
                snapshot.ref.getDownloadURL().then((url) => {
                    setUploading(true);
                    //Updating user profile in firestore
                    db.collection("User-Chats-Contents").doc(userEmail).collection("chatContents").doc(emailHash).collection("messages").add({
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        message: input,
                        imageSrc: url,
                        displayName: auth.currentUser?.displayName,
                        email: auth.currentUser?.email,
                        seen: false,
                    });
                    db.collection("User-Chats-Contents").doc(route.params.email).collection("chatContents").doc(emailHash).collection("messages").add({
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        message: input,
                        imageSrc: url,
                        displayName: auth.currentUser?.displayName,
                        email: auth.currentUser?.email,
                    });
                    db.collection('lastMessages').doc(userEmail).collection(emailHash).doc('lastMessage').set({
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        lastMessage: "🖼 Image",
                    });
                    db.collection('lastMessages').doc(route.params.email).collection(emailHash).doc('lastMessage').set({
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        lastMessage: "🖼 Image",
                    });
                });
                blob.close();
                resolve(snapshot);
                return;

            }).catch((error) => {
                setUploading(false);
                Alert.alert("Error!", error.message);
                reject(error);
            });
        });
    };

    const handleChatSelect = (id) => {

        const DeleteChat = () => {
            db.collection("User-Chats-Contents")
                .doc(userEmail)
                .collection("chatContents")
                .doc(emailHash)
                .collection("messages").doc(id).delete().then(() => {
                    console.log("Deleted!");
                }).catch((error) => {
                    Alert.alert("Error!", error.message);
                })
        }

        Alert.alert("Confirm Delete?", "Do you want to delete this message?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                },
                {
                    text: "Delete",
                    onPress: () => DeleteChat()
                }
            ])
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#30475e" }}>
            <ImageBackground
                style={{ flex: 1, justifyContent: "center" }}
                source={{ uri: chatBg }}
                resizeMode="cover"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                    keyboardVerticalOffset={105}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <>
                            <ScrollView
                                contentContainerStyle={{ padding: 10, }}
                                ref={scrollRef}
                            >
                                {messages.map(({ id, data, time, seen }) => {

                                    let msgs = <View />;

                                    if (data.email === auth.currentUser?.email) {
                                        msgs = <View key={id} style={styles.sender}>
                                            <TouchableOpacity onLongPress={() => handleChatSelect(id)}>
                                                {data.imageSrc != null ? <Image source={{ uri: data.imageSrc }} style={styles.ImageMsg} /> : null}
                                                <Text style={styles.sendermsg}>{data.message}</Text>
                                                <Text style={{ alignSelf: 'flex-end', position: 'absolute', bottom: 2, right: -8 }}><Icon name="check" type="entypo" color={seen ? "limegreen" : '#c0c0c0'} size={15} /></Text>
                                                <Text
                                                    style={{
                                                        fontSize: 9,
                                                        color: "#d9d9d9",
                                                        textAlign: "right",
                                                        position: "relative",
                                                        bottom: -9,
                                                    }}
                                                >
                                                    {time != "now" ? time.toString().slice(4, 10) : "Now"}, {time != "now" ? time.toString().slice(16, 21) : ""}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    } else {
                                        msgs = <Animatable.View animation="pulse" delay={500} key={id} style={styles.receiver}>
                                            <TouchableOpacity>
                                                {data.imageSrc != null ? <Image source={{ uri: data.imageSrc }} style={styles.ImageMsg} /> : null}
                                                <Text style={styles.recievermsg}>{data.message}</Text>
                                                <Text
                                                    style={{
                                                        fontSize: 9,
                                                        color: "#9c9c9c",
                                                        textAlign: "right",
                                                        position: "relative",
                                                        bottom: -9,
                                                    }}
                                                >
                                                    {time != "now" ? time.toString().slice(4, 10) : "Now"}, {time != "now" ? time.toString().slice(16, 21) : ""}
                                                </Text>
                                            </TouchableOpacity>
                                        </Animatable.View>
                                    }
                                    return (
                                        msgs
                                    );
                                }
                                )}
                            </ScrollView>
                            <Animatable.View useNativeDriver={true} animation="fadeInUp" easing="ease" iterationCount={1} delay={500} duration={1000} style={styles.footer}>
                                <TextInput
                                    placeholder="Write your message..."
                                    value={input}
                                    style={[styles.inputmsg, { height: height }]}
                                    onChangeText={(text) => { setInput(text) }}
                                    multiline={true}
                                    onContentSizeChange={e => handleInputHeight(e)}
                                />
                                <TouchableOpacity onPress={() => setUploadFromVisible(true)} activeOpacity={0.5}>
                                    <Icon reverse name="add" size={22} color="#007fff" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={sendMessage} activeOpacity={0.5}>
                                    <Icon reverse name="send" size={22} color="#007fff" />
                                </TouchableOpacity>
                            </Animatable.View>

                            {/* Uploading from options i.e. Camera or Gallery */}
                            <Overlay isVisible={uploadFromVisible} onBackdropPress={() => setUploadFromVisible(false)}>
                                <View style={{ padding: 15 }}>
                                    <Button
                                        title=" Camera"
                                        icon={
                                            <Icon
                                                name="camera-alt"
                                                size={20}
                                                type="material-icon"
                                                color="white"
                                            />
                                        }
                                        containerStyle={{ margin: 10, width: 200 }}
                                        onPress={selectCameraOption}
                                    />
                                    <Button
                                        title=" Gallery"
                                        icon={
                                            <Icon
                                                name="photo-library"
                                                size={20}
                                                type="material-icon"
                                                color="white"
                                            />
                                        }
                                        containerStyle={{ margin: 10, width: 200 }}
                                        onPress={selectGalleryOption}
                                    />
                                </View>
                            </Overlay>

                            {/* View selected Image */}
                            <Overlay isVisible={ImageViewVisible} onBackdropPress={() => setImageViewVisible(false)}>
                                <View style={{ padding: 15 }}>
                                    <Text style={{ color: '#007fff', alignSelf: 'center', marginVertical: 5, fontSize: 18 }}>Sending...</Text>
                                    <Image source={{ uri: image }} style={{ height: 350, width: 350, resizeMode: 'contain' }} />
                                    <ActivityIndicator size="large" color="#00ff" />
                                </View>
                            </Overlay>

                            {/* Bg selector modal */}
                            <Overlay isVisible={bgSelectorVisible} onBackdropPress={() => setBgSelectorVisible(false)}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#007fff' }}>Choose Background</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                    <TouchableOpacity onPress={() => { setChatBg(bg[0]); setBgSelectorVisible(false); storeData(bg[0]) }} >
                                        <Image style={styles.colorOptions} source={require('../assets/images/Bg1.jpg')} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setChatBg(bg[1]); setBgSelectorVisible(false); storeData(bg[1]) }} >
                                        <Image style={styles.colorOptions} source={require('../assets/images/Bg2.jpg')} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setChatBg(bg[2]); setBgSelectorVisible(false); storeData(bg[2]) }} >
                                        <Image style={styles.colorOptions} source={require('../assets/images/Bg3.jpg')} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                    <TouchableOpacity onPress={() => { setChatBg(bg[3]); setBgSelectorVisible(false); storeData(bg[3]) }} >
                                        <Image style={styles.colorOptions} source={require('../assets/images/Bg4.jpg')} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setChatBg(bg[4]); setBgSelectorVisible(false); storeData(bg[4]) }} >
                                        <Image style={styles.colorOptions} source={require('../assets/images/Bg5.jpg')} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setChatBg(bg[5]); setBgSelectorVisible(false); storeData(bg[5]) }} >
                                        <Image style={styles.colorOptions} source={require('../assets/images/Bg6.jpg')} />
                                    </TouchableOpacity>
                                </View>
                            </Overlay>
                            {/* Modal Ends! */}
                        </>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    footer: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 5,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    ImageMsg: {
        height: 280,
        width: 280,
        resizeMode: 'contain',
    },
    inputmsg: {
        width: "90%",
        padding: 12,
        borderWidth: 2,
        borderColor: '#007fff',
        bottom: 0,
        flex: 1,
        marginRight: 2,
        color: "black",
        borderRadius: 30,
        backgroundColor: "white",
        fontSize: 16,
    },
    sender: {
        padding: 15,
        alignSelf: "flex-end",
        backgroundColor: "#0648A3",
        borderRadius: 20,
        marginRight: 5,
        maxWidth: "80%",
        position: "relative",
        marginBottom: 20,
    },
    receiver: {
        padding: 15,
        alignSelf: "flex-start",
        backgroundColor: "#0f1f2f",
        borderRadius: 20,
        marginLeft: 5,
        maxWidth: "80%",
        position: "relative",
        marginBottom: 20,
    },
    sendermsg: {
        color: "white",
        fontSize: 16,
    },
    recievermsg: {
        color: "white",
        fontSize: 16,
    },
    modalView: {
        bottom: 0,
        backgroundColor: "rgba(20,20,20,1)",
        borderRadius: 20,
        padding: 15,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        position: 'absolute',
        width: Dimensions.get('window').width,
    },
    modalStyle: {
        margin: 10,
        width: "100%",
        alignItems: 'flex-start',
        marginHorizontal: 10,
        flexDirection: 'row',
    },
    modalStyleCancel: {
        padding: 10,
        width: "100%",
        alignItems: 'flex-start',
        marginHorizontal: 5,
        flexDirection: 'row',
    },
    modalOptions: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginHorizontal: 15,
        marginBottom: 5,
    },
    modalOptionCancel: {
        color: 'red',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginHorizontal: 10,
        marginBottom: 5,
    },
    colorOptions: {
        height: 150,
        width: 80,
        borderRadius: 10,
        margin: 10
    }
});