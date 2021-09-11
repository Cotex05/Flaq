import React, { useLayoutEffect, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { db } from "../firebase";

const UserProfileScreen = ({ navigation, route }) => {

    const [profileImageVisible, setProfileImageVisible] = useState(0);
    const [about, setAbout] = useState("");

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "User's Profile",
            headerTitleStyle: { fontWeight: 'bold', letterSpacing: 1 },
            headerRight: () => (
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 10
                }}>
                </View>
            ),
        });
    }, [navigation]);

    useEffect(() => {
        db.collection("user").doc(route.params.users_email).get().then(snapshot => {
            if (snapshot?.data()?.about != undefined) {
                setAbout(snapshot?.data()?.about);
            } else {
                setAbout("Hi Everyone! I am using flaq.");
            }
        })
    }, [])

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
                        source={{ uri: route.params.users_image }}
                        onLoadEnd={() => setProfileImageVisible(1)}

                    />
                </View>
                <Text style={styles.profileName}>{route.params.users_name.toLocaleUpperCase()}</Text>
            </View>
            <View>
                <View style={styles.profileObjects}>
                    <View style={styles.emailView}>
                        <Text style={{ color: 'ghostwhite', fontWeight: 'bold', fontSize: 20, paddingLeft: 10 }}>Email</Text>
                        <Text style={styles.email}>{route.params.users_email}</Text>
                    </View>
                    <View style={styles.aboutView}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: "ghostwhite", fontSize: 20, fontWeight: 'bold' }}>About</Text>
                        </View>
                        <Text style={styles.about}>{about}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

export default UserProfileScreen;

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
