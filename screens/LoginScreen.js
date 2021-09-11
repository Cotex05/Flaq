import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, KeyboardAvoidingView, Alert, ToastAndroid, Keyboard } from 'react-native';
import { Button, Input, Image } from 'react-native-elements';
import { auth } from '../firebase';

const LoginScreen = ({ navigation }) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                navigation.replace("Home");
            }
        });

        return unsubscribe;
    }, [])

    const signIn = () => {
        if (email.trim().length === 0) {
            Alert.alert("Please enter email", "Please enter your registered email address.");
            return;
        } else if (password.trim().length === 0) {
            Alert.alert("Please enter password", "Please enter your password, registered with your email address.");
            return;
        }
        auth.fetchSignInMethodsForEmail(email)
            .then(providers => {
                if (providers.length === 0) {
                    // this email hasn't signed up yet
                    Alert.alert("Not Found", "Your email address is not yet registered here. Please register an account first.",
                        [
                            {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                            },
                            { text: "Register Now", onPress: () => navigation.navigate("Register") }
                        ]
                    )
                } else {
                    // has signed up
                    auth.signInWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            // Signed in
                            const user = userCredential.user;
                            // console.log("Successfully Signed-in!", user);
                            ToastAndroid.showWithGravity(
                                `Welcome Back, ${user.displayName}`,
                                ToastAndroid.SHORT,
                                ToastAndroid.CENTER
                            );
                        })
                        .catch((error) => {
                            // Error
                            Alert.alert("Login Error!", error.message)
                        });
                }
            })
            .catch(error => Alert.alert("Login Error!", error.message));

        setEmail("");
        setPassword("");
        Keyboard.dismiss();
    }

    return (
        <KeyboardAvoidingView behavior='height' keyboardVerticalOffset={50} style={styles.container}>
            <StatusBar style="light" />
            <Image source={require('../assets/flaq_logo.png')}
                style={{ width: 200, height: 200 }}
            />
            <View style={styles.inputContainer}>
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
                    onSubmitEditing={signIn}
                    maxLength={30}
                />
            </View>
            <Button raised containerStyle={styles.button} onPress={signIn} title="Login" />
            <Button raised onPress={() => navigation.navigate("Register")} containerStyle={styles.button} type="outline" title="Register" />
        </KeyboardAvoidingView>
    )
}

export default LoginScreen;

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
