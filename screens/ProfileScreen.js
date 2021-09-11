import React, { useLayoutEffect, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, Alert, ToastAndroid, ActivityIndicator, ScrollView } from 'react-native';
import { Icon, Button, Overlay, Input } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { auth, db, storage } from '../firebase';
import * as firebase from 'firebase';

const ProfileScreen = ({ navigation }) => {

    const userProfile = auth.currentUser;
    const [status, setStatus] = useState("");
    const [image, setImage] = useState(userProfile.photoURL);
    const [uploading, setUploading] = useState(false);
    const [profileImageVisible, setProfileImageVisible] = useState(0);
    const [visible, setVisible] = useState(false);
    const [uploadFromVisible, setUploadFromVisible] = useState(false);

    // Password handling constants
    const [passChangeView, setPassChangeView] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordAgain, setNewPasswordAgain] = useState("");
    const [newPassColor, setNewPassColor] = useState('white');
    const [passwordChangeButton, setpasswordChangeButton] = useState(true);

    var opt = '';

    const unsubscribe = navigation.addListener('focus', () => {
        setStatus("");
    });

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Profile",
            headerTitleStyle: { fontWeight: 'bold', letterSpacing: 1 },
            headerRight: () => (
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 10
                }}>
                    <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={{ marginHorizontal: 5 }}>
                        <Icon name="settings" size={30} color="#fff" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation]);

    useEffect(() => {
        db.collection('user')
            .doc(userProfile.email)
            .get()
            .then(profile => {
                setStatus(profile.data().about);
            });
        unsubscribe();
    }, [status]);

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
                aspect: [4, 4],
                quality: 1,
            }).then((result) => {
                if (!result.cancelled) {
                    // User picked an image
                    const { height, width, type, uri } = result;
                    setImage(uri);
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
                    // console.log("Uploaded Successfully!");
                    ToastAndroid.showWithGravity(
                        "Profile Picture Updated!",
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                    setVisible(false);
                } else {
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

            setVisible(true);

            storageRef.child('profiles/' + userProfile.email + '.jpg').put(blob, {
                contentType: 'image/jpeg'
            }).then((snapshot) => {
                snapshot.ref.getDownloadURL().then((url) => {
                    setUploading(true);
                    userProfile.updateProfile({
                        photoURL: url
                    });
                    //Updating user profile in firestore
                    db.collection('user').doc(userProfile.email).update({
                        profileImage: url,
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

    const handlePasswordClose = () => {
        setPassChangeView(false);
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordAgain("");
        setNewPassColor('white');
    };

    const handleNewPassword = (text) => {
        setNewPassword(text);
        if (newPasswordAgain.length != 0) {
            if (text === newPasswordAgain) {
                setNewPassColor('limegreen');
                setpasswordChangeButton(false);
            } else {
                setNewPassColor('red');
                setpasswordChangeButton(true);
            }
        }
    };

    const handleNewPasswordAgain = (text) => {
        setNewPasswordAgain(text);
        if (text === newPassword && text.length != 0) {
            setNewPassColor('limegreen');
            setpasswordChangeButton(false);
        } else {
            setNewPassColor('red');
            setpasswordChangeButton(true);
        }
    };


    const changePassword = () => {
        const credential = firebase.auth.EmailAuthProvider.credential(
            userProfile.email,
            currentPassword
        );
        if (newPassword.trim().length == 0 || newPasswordAgain.trim().length == 0) {
            ToastAndroid.showWithGravity(
                "Empty Password!",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
            return;
        }
        if (newPassword.length < 8 || newPasswordAgain.length < 8) {
            Alert.alert("Password too small", "New password must be of 8 or more characters. \nMake sure password is strong enough, and contains mixture of letters, numbers and symbols.");
            return;
        }
        userProfile.reauthenticateWithCredential(credential).then(() => {
            // User re-authenticated.
            if (newPassword === newPasswordAgain) {
                userProfile.updatePassword(newPasswordAgain).then(() => {
                    // Update successful.
                    ToastAndroid.showWithGravity(
                        "Password Changed Successfully!",
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                }).catch((error) => {
                    // An error ocurred
                    Alert.alert("Error in changing password!", error.message);
                });
            }
        }).catch((error) => {
            // An error happened.
            Alert.alert("Wrong password!", "You have entered the incorrect old password!");
        });
        setPassChangeView(false);
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordAgain("");
        setNewPassColor('white');
    };

    return (
        <ScrollView style={{ backgroundColor: '#002446' }}>
            <View>
                <View>
                    <Animatable.Image
                        useNativeDriver={true}
                        animation='zoomInDown'
                        easing="ease"
                        delay={500}
                        duration={800}
                        iterationCount={1}
                        style={[styles.profileImage, { opacity: profileImageVisible }]}
                        source={{ uri: image }}
                        onLoadEnd={() => setProfileImageVisible(1)}

                    />
                    <TouchableOpacity style={styles.uploadPhoto} onPress={() => setUploadFromVisible(true)}>
                        <Icon reverse name="add-a-photo" type="material-icon" color="#007fff" />
                    </TouchableOpacity>

                    {/* Uploading Indicator */}

                    <Overlay isVisible={visible} onBackdropPress={() => setVisible(false)}>
                        <Text style={{ color: 'grey', fontSize: 20, padding: 12 }}>Uploading...</Text>
                        <ActivityIndicator size="large" color="#007fff" />
                    </Overlay>

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
                </View>
                <Text style={styles.profileName}>{userProfile.displayName.toUpperCase()}</Text>
            </View>
            <View>
                <View style={styles.profileObjects}>
                    <View style={styles.emailView}>
                        <Text style={{ color: 'ghostwhite', fontWeight: 'bold', fontSize: 20, paddingLeft: 10 }}>Email</Text>
                        <Text style={styles.email}>{userProfile.email}</Text>
                    </View>
                    <View style={styles.aboutView}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: "ghostwhite", fontSize: 20, fontWeight: 'bold' }}>About</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('About')}>
                                <Icon name="edit" color="white" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.about}>{status}</Text>
                    </View>
                    <View>
                        <Button
                            onPress={() => setPassChangeView(true)}
                            icon={
                                <Icon
                                    name="lock"
                                    size={25}
                                    color="white"
                                />
                            }
                            title=" Change Password"
                            type="outline"
                            containerStyle={{ width: 250, alignSelf: 'center', marginTop: 40 }}
                        />
                        <Overlay overlayStyle={{ backgroundColor: '#000', borderRadius: 20 }} isVisible={passChangeView} onBackdropPress={handlePasswordClose}>
                            <View style={{ width: 350, backgroundColor: '#000', borderRadius: 20 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: '#fff', fontSize: 20, padding: 12 }}>Change Password</Text>
                                    <Icon onPress={handlePasswordClose} containerStyle={{ padding: 12 }} name="cancel" color="red" />
                                </View>
                                <View>
                                    <Input
                                        leftIcon={
                                            <Icon
                                                name='lock'
                                                size={24}
                                                color='#fff'
                                            />}
                                        placeholder="Current password"
                                        autoCorrect={false}
                                        secureTextEntry
                                        type="password"
                                        value={currentPassword}
                                        onChangeText={text => setCurrentPassword(text)}
                                        maxLength={30}
                                        inputStyle={{ color: '#fff' }}
                                        autoFocus={true}
                                    />
                                    <Input
                                        leftIcon={
                                            <Icon
                                                name='lock'
                                                size={24}
                                                color={newPassColor}
                                            />}
                                        placeholder="Type new password"
                                        autoCorrect={false}
                                        secureTextEntry
                                        type="password"
                                        value={newPassword}
                                        onChangeText={text => handleNewPassword(text)}
                                        maxLength={30}
                                        inputStyle={{ color: '#fff' }}
                                    />
                                    <Input
                                        leftIcon={
                                            <Icon
                                                name='lock'
                                                size={24}
                                                color={newPassColor}
                                            />}
                                        placeholder="Retype new password"
                                        autoCorrect={false}
                                        secureTextEntry
                                        type="password"
                                        value={newPasswordAgain}
                                        onChangeText={text => handleNewPasswordAgain(text)}
                                        maxLength={30}
                                        inputStyle={{ color: '#fff' }}
                                    />
                                </View>
                                <Button
                                    title="Confirm Change"
                                    containerStyle={{ width: 200, alignSelf: 'center', paddingVertical: 12 }}
                                    onPress={changePassword}
                                    disabled={passwordChangeButton}
                                />
                            </View>
                        </Overlay>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

export default ProfileScreen;

const styles = StyleSheet.create({
    profileImage: {
        height: 250,
        width: Dimensions.get('window').width,
        aspectRatio: 1,
        resizeMode: 'cover',
        borderColor: '#fff',
        borderWidth: 2,
        alignSelf: 'center',
        borderRadius: 300,
        marginTop: 15,
    },
    profileName: {
        color: "#fff",
        fontSize: 25,
        padding: 15,
        alignSelf: 'center',
        fontFamily: 'serif',
    },
    uploadPhoto: {
        position: 'absolute',
        bottom: -16,
        right: Dimensions.get('window').width / 2 - Dimensions.get('window').width / 3.5,
    },
    profileObjects: {
        padding: 5,
        width: "95%",
        alignSelf: 'center',
        marginVertical: 12,
    },
    emailView: {
        padding: 15,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    email: {
        color: 'grey',
        fontFamily: 'serif',
        fontWeight: 'bold',
        fontSize: 15,
        letterSpacing: 1,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        letterSpacing: -0.5
    },
    aboutView: {
        backgroundColor: "rgba(0,0,0,0.2)",
        padding: 15,
        borderRadius: 15,
        marginVertical: 15,
    },
    about: {
        color: "#00e688",
        fontFamily: 'serif',
        fontSize: 16,
        paddingLeft: 10,
    }
})
