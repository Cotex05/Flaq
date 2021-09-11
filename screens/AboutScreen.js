import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TextInput, Alert, Keyboard } from 'react-native';
import { Button } from 'react-native-elements';
import { auth, db } from '../firebase';

const AboutScreen = ({ navigation }) => {

    const [input, setInput] = useState("");

    const user = auth.currentUser;

    const [status, setStatus] = useState("write your status here...");
    const [statusState, setStatusState] = useState(false);

    const changeStatus = async () => {
        if (input.trim().length != 0) {
            await db.collection('user').doc(user.email).update({
                about: input,
            }).then(() => {
                Keyboard.dismiss();
                Alert.alert("Status Updated!", `Your status is changed to "${input}".`,
                    [
                        { text: "OK", onPress: () => navigation.navigate('Profile') }
                    ]
                );
                setStatusState(!statusState);
            })
        } else {
            Alert.alert("Empty field not allowed!", "Please write something first.")
        }
        setInput("");
    }

    useEffect(() => {
        db.collection('user')
            .doc(user.email)
            .get()
            .then(profile => {
                setStatus(profile.data().about);
            })
    }, [statusState])

    return (
        <View style={{ backgroundColor: '#002446', height: Dimensions.get('window').height }}>
            <TextInput
                style={styles.aboutInput}
                placeholder={status}
                maxLength={100}
                multiline={true}
                value={input}
                onChangeText={text => setInput(text)}
            />
            <Button onPress={changeStatus} title="Change Status" containerStyle={{ width: 250, alignSelf: 'center' }} />
        </View>
    )
}

export default AboutScreen

const styles = StyleSheet.create({
    aboutInput: {
        backgroundColor: '#fff',
        color: '#2a2a2a',
        padding: 10,
        margin: 15,
        borderRadius: 15,
        fontSize: 18,
        fontFamily: 'serif',
    }
})
