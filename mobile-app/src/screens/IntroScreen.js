import React, { useState, useEffect, useRef, useContext } from "react";
import {
    StyleSheet,
    View,
    Image,
    ImageBackground,
    Text,
    Dimensions,
    Linking,
    Platform,
    Alert,
    StatusBar,
} from "react-native";
import MaterialButtonDark from "../components/MaterialButtonDark";
import * as Facebook from 'expo-facebook';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from "expo-crypto";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";
import { FirebaseContext } from 'common/src';
import { colors } from "../common/theme";
import Constants from "expo-constants";
import RNPickerSelect from 'react-native-picker-select';
import i18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ionicons } from '@expo/vector-icons';
import { Ionicons } from 'react-native-vector-icons';

import moment from 'moment/min/moment-with-locales';
import AppIntroSlider from 'react-native-app-intro-slider';

const slides = [
    {
        key: 'somethun',
        title: 'Select Destination',
        text: 'Drag or enter your destination \nfrom map',
        image: require('../../assets/images/img_info1.png'),
        backgroundColor: '#59b2ab',
    },
    {
        key: 'somethun-dos',
        title: 'Pick Up & Drop',
        text: 'Google Map Based \nActual Pick and Drop Services',
        image: require('../../assets/images/img_info2.png'),
        backgroundColor: '#febe29',
    },
    {
        key: 'somethun1',
        title: 'Enjoy Your Ride',
        text: 'Ride with us, Hassle free',
        image: require('../../assets/images/img_info3.png'),
        backgroundColor: '#22bcb5',
    }
];

export default function IntroScreen(props) {

    const { api } = useContext(FirebaseContext);
    const {
        facebookSignIn,
        appleSignIn,
        clearLoginError
    } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const { t } = i18n;
    const settings = useSelector(state => state.settingsdata.settings);
    const pageActive = useRef(false);
    const [langSelection, setLangSelection] = useState();
    const languagedata = useSelector(state => state.languagedata);

    useEffect(() => {
        setLangSelection(i18n.locale);
    }, []);

    useEffect(() => {
        if (auth.info && pageActive.current) {
            pageActive.current = false;
            props.navigation.navigate('AuthLoading');
        }
        if (auth.error && auth.error.msg && pageActive.current && auth.error.msg.message !== t('not_logged_in')) {
            pageActive.current = false;
            if (auth.error.msg.message === t('require_approval') || auth.error.msg.message === t('email_verify_message')) {
                setState({
                    ...state,
                    password: '',
                    phoneNumber: null,
                    verificationId: null,
                    verificationCode: null
                });
            }
            Alert.alert(t('alert'), t('login_error'));
            dispatch(clearLoginError());
        }
    }, [auth.info, auth.error]);

    const FbLogin = async () => {
        try {
            await Facebook.initializeAsync({ appId: Constants.manifest.facebookAppId });
            const {
                type,
                token
            } = await Facebook.logInWithReadPermissionsAsync({
                permissions: ['public_profile', "email"],
            });
            if (type === 'success') {
                pageActive.current = true;
                dispatch(facebookSignIn(token));
            }
            else {
                Alert.alert(t('alert'), t('facebook_login_auth_error'));
            }
        } catch ({ message }) {
            Alert.alert(t('alert'), t('facebook_login_auth_error') + ' ' + message);
        }
    }

    const AppleLogin = async () => {
        const csrf = Math.random().toString(36).substring(2, 15);
        const nonce = Math.random().toString(36).substring(2, 10);
        const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
        try {
            const applelogincredentials = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                state: csrf,
                nonce: hashedNonce
            });

            pageActive.current = true;
            dispatch(appleSignIn({
                idToken: applelogincredentials.identityToken,
                rawNonce: nonce,
            }));

        } catch (error) {
            if (error.code === 'ERR_CANCELED') {
                console.log(error);
            } else {
                Alert.alert(t('alert'), t('apple_signin_error'));
            }
        }
    }

    const onPressLoginEmail = async () => {
        pageActive.current = false;
        props.navigation.navigate("Login");
    }

    const onPressRegister = async () => {
        pageActive.current = false;
        props.navigation.navigate("Reg");
    }


    const openTerms = async () => {
        Linking.openURL(settings.CompanyTerms).catch(err => console.error("Couldn't load page", err));
    }

    const _renderItem = ({ item }) => {
        return (
            <View style={{
                flex: 1,
                flexDirection: "column"
            }}>
                <ImageBackground source={item.image} style={styles.image}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.text}>{item.text}</Text>
                </ImageBackground>

            </View>
        );
    }

    const _renderNextButton = () => {
        return (
            <View style={styles.buttonCircle}>
                <Ionicons
                    name="arrow-forward-outline"
                    color="black"
                    size={24}
                    style={{ backgroundColor: 'transparent' }}
                />
            </View>
        );
    };
    const _renderDoneButton = () => {
        return (
            <View style={styles.buttonCircle}>
                <Ionicons
                    name="checkmark-outline"
                    color="black"
                    size={24}
                    style={{ backgroundColor: 'transparent' }}
                />
            </View>
        );
    };

    return (
        <>
            <StatusBar hidden={false} backgroundColor={colors.TRANSPARENT} translucent />
            <AppIntroSlider
                renderItem={_renderItem}
                slides={slides}
                onDone={onPressLoginEmail}
                renderDoneButton={_renderDoneButton}
                renderNextButton={_renderNextButton} />
        </>

        //     <ImageBackground
        //         source={require('../../assets/images/bg.jpg')}
        //         resizeMode="stretch"
        //         style={styles.imagebg}
        //     >
        //         <View style={styles.topSpace}></View>
        //         {/* <View style={{ position: 'absolute', top: 40, right: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 0.3, borderRadius: 20, padding: 3, }}>
        //             <Text style={{ color: colors.BLACK, marginLeft: 3 }}>Lang:</Text>
        //             {langSelection && languagedata && languagedata.json ?
        //                 <RNPickerSelect
        //                     placeholder={{}}
        //                     value={langSelection}
        //                     useNativeAndroidPickerStyle={true}
        //                     style={{
        //                         inputIOS: styles.pickerStyle,
        //                         inputAndroid: styles.pickerStyle,
        //                         placeholder: {
        //                             color: 'white'
        //                         },

        //                     }}
        //                     onValueChange={
        //                         (text) => {
        //                             setLangSelection(text);
        //                             i18n.locale = text;
        //                             moment.locale(text);
        //                             AsyncStorage.setItem('language', text);
        //                         }
        //                     }
        //                     label={"Language"}
        //                     items={Object.keys(languagedata.json).map(function (key) { return { label: key, value: key }; })}
        //                     Icon={() => { return <Ionicons style={{ marginTop: 4 }} name="md-arrow-down" size={20} color="gray" />; }}
        //                 />
        //                 : null}
        //         </View> */}
        //         <MaterialButtonDark
        //             onPress={onPressLoginEmail}
        //             style={styles.materialButtonDark}
        //         >{t('login')}</MaterialButtonDark>
        //         {settings && settings.MobileLoginEnabled ?
        //             <MaterialButtonDark
        //                 onPress={onPressRegister}
        //                 style={styles.materialButtonDark2}
        //             >{t('register')}</MaterialButtonDark>
        //             : null}
        //         {/* {(Platform.OS == 'ios' && settings && settings.AppleLoginEnabled) || (settings && settings.FacebookLoginEnabled) ? */}
        //         {settings && settings.FacebookLoginEnabled && Platform.OS == 'android' ?
        //             <View style={styles.seperator}>
        //                 <View style={styles.lineLeft}></View>
        //                 <View style={styles.lineLeftFiller}>
        //                     <Text style={styles.sepText}>{t('spacer_message')}</Text>
        //                 </View>
        //                 <View style={styles.lineRight}></View>
        //             </View>
        //             : null}

        //         {(Platform.OS == 'ios' && settings && settings.AppleLoginEnabled) || (settings && settings.FacebookLoginEnabled) ?
        //             <View style={styles.socialBar}>
        //                 {settings && settings.FacebookLoginEnabled && Platform.OS == 'android' ?
        //                     <TouchableOpacity style={styles.socialIcon} onPress={FbLogin}>
        //                         <Image
        //                             source={require("../../assets/images/image_fb.png")}
        //                             resizeMode="contain"
        //                             style={styles.socialIconImage}
        //                         ></Image>
        //                     </TouchableOpacity>
        //                     : null}
        //                 {/* {Platform.OS == 'ios' && settings.AppleLoginEnabled ?
        //                     <TouchableOpacity style={styles.socialIcon} onPress={AppleLogin}>
        //                         <Image
        //                             source={require("../../assets/images/image_apple.png")}
        //                             resizeMode="contain"
        //                             style={styles.socialIconImage}
        //                         ></Image>
        //                     </TouchableOpacity>
        //                     : null} */}
        //             </View>
        //             : null}
        //         {/* <View>
        //             <TouchableOpacity style={styles.terms} onPress={openTerms}>
        //                 <Text style={styles.actionText}>{t('terms')}</Text>
        //             </TouchableOpacity>
        //         </View> */}

        //     </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    imagebg: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: Dimensions.get('window').width,
        height: '100%',
    },
    topSpace: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        height: Dimensions.get('window').height * 0.56,
        width: Dimensions.get('window').width
    },
    materialButtonDark: {
        height: 40,
        marginTop: 20,
        marginLeft: 35,
        marginRight: 35,
        backgroundColor: colors.GREY.iconSecondary,
    },
    materialButtonDark2: {
        height: 40,
        marginTop: 14,
        marginLeft: 35,
        marginRight: 35,
        backgroundColor: colors.GREY.iconSecondary,
    },
    actionLine: {
        height: 20,
        flexDirection: "row",
        marginTop: 20,
        alignSelf: 'center'
    },
    actionItem: {
        height: 20,
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center"
    },
    actionText: {
        fontSize: 15,
        fontFamily: "Poppins-Regular",
        fontWeight: 'bold'
    },
    seperator: {
        width: 250,
        height: 20,
        flexDirection: "row",
        marginTop: 20,
        alignSelf: 'center'
    },
    lineLeft: {
        width: 40,
        height: 1,
        backgroundColor: "rgba(113,113,113,1)",
        marginTop: 9
    },
    sepText: {
        color: colors.BLACK,
        fontSize: 16,
        fontFamily: "Poppins-Regular"
    },
    lineLeftFiller: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center"
    },
    lineRight: {
        width: 40,
        height: 1,
        backgroundColor: "rgba(113,113,113,1)",
        marginTop: 9
    },
    socialBar: {
        height: 40,
        flexDirection: "row",
        marginTop: 15,
        alignSelf: 'center'
    },
    socialIcon: {
        width: 40,
        height: 40,
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center"
    },
    socialIconImage: {
        width: 40,
        height: 40
    },
    terms: {
        marginTop: 18,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: "center",
        opacity: .54
    },
    pickerStyle: {
        color: colors.BLACK,
        width: 50,
        fontSize: 20,
        height: 30,
        marginLeft: 3,
        fontWeight: 'bold',
        alignContent: 'center',
        justifyContent: 'center',
    },

    image: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "flex-end"
    },
    text: {
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
        marginBottom: 65,
        fontFamily: 'Poppins-Regular',
    },
    title: {
        fontSize: 22,
        color: '#ea4b6a',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'Poppins-Regular',
    },
});
