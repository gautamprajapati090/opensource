import React, { useState, useRef, useEffect, useContext } from "react";
import {
    StyleSheet,
    View,
    ImageBackground,
    Text,
    Dimensions,
    KeyboardAvoidingView,
    Alert,
    TextInput,
    Image,
    ActivityIndicator,
    Platform,
    Linking,
    StatusBar
} from "react-native";
import OtpInputs from "react-native-otp-inputs";
import MaterialButtonDark from "../components/MaterialButtonDark";
import { TouchableOpacity } from "react-native-gesture-handler";
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from 'common/src';
import { colors } from '../common/theme';
import { Entypo } from 'react-native-vector-icons';
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import RNPickerSelect from 'react-native-picker-select';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import i18n from 'i18n-js';

var { width, height } = Dimensions.get('window');

export default function EmailLoginScreen(props) {
    const { api, config, authRef } = useContext(FirebaseContext);
    const {
        signIn,
        sendResetMail,
        clearLoginError,
        requestPhoneOtpDevice,
        mobileSignIn,
        checkUserExists,
        countries
    } = api;
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const dispatch = useDispatch();

    const formatCountries = () => {
        let arr = [];
        for (let i = 0; i < countries.length; i++) {
            let txt = countries[i].label + " (+" + countries[i].phone + ")";
            arr.push({ label: txt, value: txt, key: txt });
        }
        return arr;
    }

    const [state, setState] = useState({
        email: '',
        password: '',
        customStyleIndex: 0,
        phoneNumber: null,
        verificationId: null,
        // verificationCode: null,
        countryCodeList: formatCountries(),
        countryCode: null
    });
    const [verificationCode, setVerificationCode] = useState('');

    const emailInput = useRef(null);
    const passInput = useRef(null);
    const pageActive = useRef(false);
    const [loading, setLoading] = useState(false);
    const recaptchaVerifier = useRef(null);

    const ref = useBlurOnFulfill({ verificationCode, cellCount: 6 });
    const [propss, getCellOnLayoutHandler] = useClearByFocusCell({
        verificationCode,
        setVerificationCode,
    });


    const { t } = i18n;

    useEffect(() => {

        if (settings) {
            for (let i = 0; i < countries.length; i++) {
                if (countries[i].label == settings.country) {
                    setState({ ...state, countryCode: settings.country + " (+" + countries[i].phone + ")" })
                }
            }
        }
    }, [settings]);

    useEffect(() => {
        if (auth.info && pageActive.current) {
            pageActive.current = false;
            props.navigation.navigate('AuthLoading');
            setLoading(false);
        }
        if (auth.error && auth.error.msg && pageActive.current && auth.error.msg.message !== t('not_logged_in')) {
            pageActive.current = false;
            setState({ ...state, verificationCode: '' });
            Alert.alert(t('alert'), auth.error.msg.message);
            dispatch(clearLoginError());
            setLoading(false);
        }
        if (auth.verificationId) {
            pageActive.current = false;
            setState({ ...state, verificationId: auth.verificationId });
            setLoading(false);
        }
    }, [auth.info, auth.error, auth.error.msg, auth.verificationId]);

    const onPressLogin = async () => {
        setLoading(true);
        if (state.countryCode && state.countryCode !== t('select_country')) {
            if (state.phoneNumber) {
                let formattedNum = state.phoneNumber.replace(/ /g, '');
                formattedNum = state.countryCode.split("(")[1].split(")")[0] + formattedNum.replace(/-/g, '');
                if (formattedNum.length > 8) {
                    checkUserExists({ mobile: formattedNum }).then((res) => {
                        if (res.users && res.users.length > 0) {
                            pageActive.current = true;
                            dispatch(requestPhoneOtpDevice(formattedNum, recaptchaVerifier.current));
                        }
                        else {
                            setLoading(false);
                            Alert.alert(t('alert'), t('user_does_not_exists'));
                        }
                    });
                } else {
                    Alert.alert(t('alert'), t('mobile_no_blank_error'));
                    setLoading(false);
                }
            } else {
                Alert.alert(t('alert'), t('mobile_no_blank_error'));
                setLoading(false);
            }
        } else {
            Alert.alert(t('alert'), t('country_blank_error'));
            setLoading(false);
        }
    }

    const onSignIn = async () => {
        setLoading(true);
        pageActive.current = true;
        dispatch(mobileSignIn(
            state.verificationId,
            // state.verificationCode
            verificationCode
        ));
    }

    const CancelLogin = () => {
        setState({
            ...state,
            phoneNumber: null,
            verificationId: null,
            verificationCode: null
        });
    }

    const validateEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const emailValid = re.test(email);
        if (!emailValid) {
            emailInput.current.focus();
            setLoading(false);
            Alert.alert(t('alert'), t('valid_email_check'));
        }
        return emailValid;
    }

    const onAction = async () => {
        setLoading(true);
        const { email, password } = state;
        if (validateEmail(email)) {
            if (password != '') {
                pageActive.current = true;
                dispatch(signIn(email, password));
                setState({
                    ...state,
                    email: '',
                    password: ''
                });
                emailInput.current.focus();
            } else {
                passInput.current.focus();
                setLoading(false);
                Alert.alert(t('alert'), t('password_blank_messege'));
            }
        }

    }

    const Forgot_Password = async (email) => {
        if (validateEmail(email)) {
            Alert.alert(
                t('forgot_password_link'),
                t('forgot_password_confirm'),
                [
                    { text: t('cancel'), onPress: () => { }, style: 'cancel', },
                    {
                        text: t('ok'),
                        onPress: () => {
                            pageActive.current = true;
                            dispatch(sendResetMail(email));
                        },
                    }
                ],
                { cancelable: true },
            )
        }
    }

    const handleCustomIndexSelect = (index) => {
        setState({ ...state, customStyleIndex: index });
    };

    const openTerms = async () => {
        Linking.openURL(settings.CompanyTerms).catch(err => console.error("Couldn't load page", err));
    }

    const onPressRegister = async () => {
        pageActive.current = false;
        props.navigation.navigate("Reg");
    }

    return (

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <StatusBar hidden={false} backgroundColor={colors.TRANSPARENT} translucent />

            <ImageBackground
                source={require('../../assets/images/img_bg_logo.png')}
                resizeMode="stretch"
                style={styles.imagebg}
            >
                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={config}
                />
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => { props.navigation.navigate('Intro') }}>
                        {/* <Image
                            source={require("../../assets/images/ios-back.png")}
                            resizeMode="contain"
                            style={styles.backButtonImage}
                        ></Image> */}
                        <Entypo name="chevron-left" size={24} color={colors.WHITE} />
                    </TouchableOpacity>
                </View>

                {!state.verificationId &&
                    <View style={{ marginHorizontal: 20, marginTop: - height * 0.16 }}>
                        <Text style={styles.text}>Ride with Pink Lady Cabs</Text>
                        <Text style={styles.text2}>Enter your mobile number to Login</Text>
                        <View style={styles.phoneView}>
                            {/* <RNPickerSelect
                                placeholder={{ label: t('select_country'), value: t('select_country') }}
                                value={state.countryCode}
                                useNativeAndroidPickerStyle={true}
                                style={{
                                    inputIOS: styles.pickerStyle,
                                    inputAndroid: styles.pickerStyle,
                                }}
                                onValueChange={(value) => setState({ ...state, countryCode: value })}
                                items={state.countryCodeList}
                                disabled={!!state.verificationId || !settings.AllowCountrySelection ? true : false}
                            /> */}
                            <Text style={styles.pickerStyle}>+91</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('mobile_no_placeholder')}
                                onChangeText={(value) => setState({ ...state, phoneNumber: value })}
                                value={state.phoneNumber}
                                editable={!!state.verificationId ? false : true}
                                keyboardType="phone-pad"
                                returnKeyType="done"
                            />
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <TouchableOpacity style={styles.button}
                                activeOpacity={.5}
                                onPress={() => onPressLogin()}>
                                <Text style={styles.buttonText}>
                                    Next
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={{ ...styles.text, fontFamily: 'Poppins-Regular' }}>New User? <Text style={{ ...styles.text, textDecorationLine: 'underline', color: colors.BLUE.primary }} onPress={onPressRegister}>Register</Text></Text>

                    </View>
                }

                {!!state.verificationId &&
                    <View style={{ marginHorizontal: 20, marginTop: - height * 0.16 }}>

                        <Text style={styles.text}>Hey there,</Text>
                        <Text style={styles.text2}>Enter the 6 digit code sent to your mobile number</Text>
                        <Text style={styles.text2}>{'+91 '}{state.phoneNumber}</Text>
                        <View style={{ ...styles.phoneView, borderBottomWidth: 0, alignSelf: 'center' }}>
                            <CodeField
                                ref={ref}
                                {...propss}
                                // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                                value={verificationCode}
                                onChangeText={setVerificationCode}
                                cellCount={6}
                                rootStyle={{ marginTop: 20 }}
                                keyboardType="number-pad"
                                returnKeyType="done"
                                textContentType="oneTimeCode"
                                renderCell={({ index, symbol, isFocused }) => (
                                    <Text
                                        key={index}
                                        style={[styles.cell, isFocused && styles.focusCell]}
                                        onLayout={getCellOnLayoutHandler(index)}>
                                        {symbol || (isFocused ? <Cursor /> : null)}
                                    </Text>
                                )}
                            />
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <TouchableOpacity style={styles.button}
                                activeOpacity={.5}
                                onPress={() => onSignIn()}>
                                <Text style={styles.buttonText}>
                                    Next
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.actionLine}>
                            <TouchableOpacity style={styles.actionItem} onPress={CancelLogin}>
                                <Text style={styles.actionText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                {/* <SegmentedControlTab
                    values={[t('email_login'), t('mobile_login_title')]}
                    selectedIndex={state.customStyleIndex}
                    onTabPress={handleCustomIndexSelect}
                    borderRadius={0}
                    tabsContainerStyle={styles.segmentcontrol}
                    tabStyle={{
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        borderColor: 'transparent',
                    }}
                    activeTabStyle={{ borderBottomColor: colors.GREY.background, backgroundColor: 'transparent', borderBottomWidth: 2, marginTop: 2 }}
                    tabTextStyle={{ color: colors.WHITE, fontWeight: 'bold' }}
                    activeTabTextStyle={{ color: colors.GREY.background }}
                /> 
                 {state.customStyleIndex == 0 ?
                    <View style={styles.box1}>
                        <TextInput
                            ref={emailInput}
                            style={styles.textInput}
                            placeholder={t('email_placeholder')}
                            onChangeText={(value) => setState({ ...state, email: value.trim() })}
                            value={state.email}
                        />
                    </View>
                    : null}
                {state.customStyleIndex == 0 ?
                    <View style={styles.box2}>
                        <TextInput
                            ref={passInput}
                            style={styles.textInput}
                            placeholder={t('password_placeholder')}
                            onChangeText={(value) => setState({ ...state, password: value })}
                            value={state.password}
                            secureTextEntry={true}
                        />
                    </View>
                    : null} 
                 {state.customStyleIndex == 0 ?
                    <MaterialButtonDark
                        onPress={onAction}
                        style={styles.materialButtonDark}
                    >{t('login_button')}</MaterialButtonDark>
                    : null}
                {state.customStyleIndex == 0 ?
                    <View style={styles.linkBar}>
                        <TouchableOpacity style={styles.barLinks} onPress={() => Forgot_Password(state.email)}>
                            <Text style={styles.linkText}>{t('forgot_password_link')}</Text>
                        </TouchableOpacity>
                    </View>
                    : null} 
                 {state.customStyleIndex != 0 ?
                    <View style={styles.box1}>
                        <RNPickerSelect
                            placeholder={{ label: t('select_country'), value: t('select_country') }}
                            value={state.countryCode}
                            useNativeAndroidPickerStyle={true}
                            style={{
                                inputIOS: styles.pickerStyle,
                                inputAndroid: styles.pickerStyle,
                            }}
                            onValueChange={(value) => setState({ ...state, countryCode: value })}
                            items={state.countryCodeList}
                            disabled={!!state.verificationId || !settings.AllowCountrySelection ? true : false}
                        />
                    </View>
                    : null}
                {state.customStyleIndex != 0 ?
                    <View style={styles.box2}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={t('mobile_no_placeholder')}
                            onChangeText={(value) => setState({ ...state, phoneNumber: value })}
                            value={state.phoneNumber}
                            editable={!!state.verificationId ? false : true}
                            keyboardType="phone-pad"
                        />
                    </View>
                    : null} 
                 {state.customStyleIndex != 0 ? state.verificationId ? null :
                    <MaterialButtonDark
                        onPress={onPressLogin}
                        style={styles.materialButtonDark}
                    >{t('request_otp')}</MaterialButtonDark>
                    : null}
                {state.customStyleIndex != 0 && !!state.verificationId ?
                    <View style={styles.box2}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={t('otp_here')}
                            onChangeText={(value) => setState({ ...state, verificationCode: value })}
                            value={state.verificationCode}
                            ditable={!!state.verificationId}
                            keyboardType="phone-pad"
                            secureTextEntry={true}
                        />
                    </View>
                    : null}
                {state.customStyleIndex != 0 && !!state.verificationId ?
                    <MaterialButtonDark
                        onPress={onSignIn}
                        style={styles.materialButtonDark}
                    >{t('authorize')}</MaterialButtonDark>
                    : null}
                {state.verificationId ?
                    <View style={styles.actionLine}>
                        <TouchableOpacity style={styles.actionItem} onPress={CancelLogin}>
                            <Text style={styles.actionText}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                    : null} */}
                <View style={{ marginHorizontal: 10, position: 'absolute', bottom: 25 }}>
                    <Text style={styles.actionText}>By continuing, you agree that you have read and accept out <Text style={{ ...styles.actionText, textDecorationLine: 'underline' }} onPress={openTerms}>{'terms'}</Text></Text>
                    {/* <TouchableOpacity style={styles.terms} onPress={openTerms}>
                    <Text style={styles.actionText}>{t('terms')}</Text>
                </TouchableOpacity> */}
                </View>
                {loading ?
                    <View style={styles.loading}>
                        <ActivityIndicator color={colors.BLACK} size='large' />
                    </View>
                    : null}
            </ImageBackground>
        </KeyboardAvoidingView>

    );
}

const styles = StyleSheet.create({
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40
    },
    container: {
        flex: 1,
    },
    imagebg: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height + (Platform.OS == 'android' ? 40 : 0),
    },
    topBar: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        height: (Dimensions.get('window').height * 0.52) + (Platform.OS == 'android' ? 40 : 0)
    },
    backButton: {
        height: 40,
        width: 40,
        marginLeft: 10,
        marginTop: 45
    },
    backButtonImage: {
        height: 40,
        width: 40,
    },
    segmentcontrol: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily: "Poppins-Regular",
        marginTop: 0,
        alignSelf: "center",
        height: 50,
        marginLeft: 35,
        marginRight: 35
    },

    box1: {
        height: 35,
        backgroundColor: colors.WHITE,
        marginTop: 26,
        marginLeft: 35,
        marginRight: 35,
        borderWidth: 1,
        borderColor: colors.GREY.border,
        justifyContent: 'center'
    },
    box2: {
        height: 35,
        backgroundColor: colors.WHITE,
        marginTop: 12,
        marginLeft: 35,
        marginRight: 35,
        borderWidth: 1,
        borderColor: colors.GREY.border,
        justifyContent: 'center'
    },

    textInput: {
        flex: 1,
        color: colors.GREY.background,
        fontSize: 18,
        fontFamily: "Poppins-Regular",
        textAlign: "left",
        marginLeft: 10,
    },
    materialButtonDark: {
        height: 35,
        marginTop: 22,
        marginLeft: 35,
        marginRight: 35,
        backgroundColor: colors.GREY.iconSecondary,
    },
    linkBar: {
        flexDirection: "row",
        marginTop: 30,
        alignSelf: 'center'
    },
    barLinks: {
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center",
        fontSize: 18,
        fontWeight: 'bold'
    },
    linkText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.WHITE,
        fontFamily: "Poppins-Bold",
    },
    pickerStyle: {
        color: colors.GREY.background,
        fontFamily: "Poppins-Regular",
        fontSize: 18,
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


    text: {
        fontSize: 18,
        color: 'black',
        textAlign: 'left',
        fontFamily: 'Poppins-Medium',
    },
    text2: {
        fontSize: 15,
        color: 'black',
        textAlign: 'left',
        fontFamily: 'Poppins-Regular',
    },
    buttonText: {
        paddingVertical: 5,
        paddingLeft: 20,
        paddingRight: 20,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: 'white',
        textAlign: 'center'
    },
    button: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: colors.PINK.primary,
        // alignSelf: 'flex-end',
        marginTop: 10,
        width: 100,
    },
    phoneView: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.GREY.iconPrimary,
        paddingBottom: 7,
    },
    cell: {
        width: 40,
        height: 40,
        lineHeight: 38,
        fontSize: 24,
        borderWidth: 1,
        borderColor: colors.GREY.iconPrimary,
        borderRadius: 5,
        textAlign: 'center',
        marginHorizontal: 10
    },
    focusCell: {
        borderColor: '#000',
    },
});