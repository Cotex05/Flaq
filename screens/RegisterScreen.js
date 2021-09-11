import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, KeyboardAvoidingView, Alert } from 'react-native';
import { Button, Input, Image, Icon } from 'react-native-elements';
import { auth, db } from '../firebase';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const register = () => {
        if (name.trim().length === 0 || name.length < 5) {
            Alert.alert("Full Name Required!", "Please enter your full name.");
            return;
        }
        else if (email.trim().length === 0) {
            Alert.alert("Please enter email", "Please enter a valid email address.");
            return;
        } else if (password.trim().length === 0) {
            Alert.alert("Please enter password", "Please enter a strong password, it will be register with your email address.");
            return;
        }
        auth.createUserWithEmailAndPassword(email, password)
            .then((authUser) => {
                authUser.user.updateProfile({
                    displayName: name,
                    photoURL: "https://i.imgur.com/qlBdn0Q.png",
                });
            })
            .catch(error => Alert.alert("Sign-up error!", error.message));

        db.collection("user").doc(email).set({
            username: name,
            email: email.toLocaleLowerCase(),
            profileImage: "https://i.imgur.com/qlBdn0Q.png",
            about: "Hi Everyone! I am using Flaq."
        });
    }

    return (
        <KeyboardAvoidingView behavior='height' keyboardVerticalOffset={50} style={styles.container}>
            <StatusBar style="light" />
            <Image source={require('../assets/flaq_logo.png')}
                style={{ width: 100, height: 100 }}
            />
            <Text style={{ margin: 20, fontSize: 25, fontWeight: 'bold', color: '#007fff' }}>
                Create New Account
            </Text>
            <View style={styles.inputContainer}>
                <Input
                    placeholder="Enter your Full Name"
                    autoCorrect={false}
                    type="text"
                    value={name}
                    onChangeText={text => setName(text)}
                    maxLength={25}
                />
                <Input
                    placeholder="Email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    type="email"
                    value={email}
                    onChangeText={text => setEmail(text.toLocaleLowerCase())}
                    maxLength={50}
                />
                <Input
                    placeholder="Password"
                    autoCorrect={false}
                    secureTextEntry
                    type="password"
                    value={password}
                    onChangeText={text => setPassword(text)}
                    maxLength={30}
                />
            </View>
            <Button raised containerStyle={styles.button} onPress={register} title="Register" />
        </KeyboardAvoidingView>
    )
}

export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#fff'
    },
    inputContainer: {
        width: 300,
    },
    button: {
        width: 200,
        marginTop: 10
    }
})
