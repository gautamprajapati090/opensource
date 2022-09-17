import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Platform,
    StyleSheet,
    Alert,
    TextInput,
    TouchableOpacity
} from 'react-native';
import { Icon, Button, Header, Input } from 'react-native-elements'
import { colors } from '../common/theme';

import i18n from 'i18n-js';
var { height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { FirebaseContext } from 'common/src';
import { hasNotch } from '../common/utility';

export default function EditProfilePage(props) {
    const { api } = useContext(FirebaseContext);
    const {
        updateProfile
    } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const [profileData, setProfileData] = useState(null);
    const { t } = i18n;

    useEffect(() => {
        if (auth.info && auth.info.profile) {
            setProfileData({
                firstName: !auth.info.profile.firstName || auth.info.profile.firstName === ' ' ? '' : auth.info.profile.firstName,
                lastName: !auth.info.profile.lastName || auth.info.profile.lastName === ' ' ? '' : auth.info.profile.lastName,
                email: !auth.info.profile.email || auth.info.profile.email === ' ' ? '' : auth.info.profile.email,
                mobile: !auth.info.profile.mobile || auth.info.profile.mobile === ' ' ? '' : auth.info.profile.mobile,
                loginType: auth.info.profile.loginType ? 'social' : 'email',
                usertype: auth.info.profile.usertype,
                uid: auth.info.uid
            });
        }
    }, [auth.info, auth.email]);

    // email validation
    const validateEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const emailValid = re.test(email)
        return emailValid;
    }

    //register button click after all validation
    const saveProfile = async () => {
        if (
            profileData.firstName &&
            profileData.firstName.length > 0 &&
            profileData.firstName &&
            profileData.firstName.length > 0 &&
            profileData.mobile && profileData.mobile.length &&
            validateEmail(profileData.email)
        ) {
            let userData = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                mobile: profileData.mobile,
                email: profileData.email
            }
            dispatch(updateProfile(auth.info, userData));
            Alert.alert(t('alert'), t('profile_updated'));
            props.navigation.pop();
        }
        else {
            Alert.alert(t('alert'), t('no_details_error'));
        }
    }

    return (
        <View style={styles.main}>
            <Header
                backgroundColor={colors.TRANSPARENT}
                leftComponent={{ icon: 'md-close', type: 'ionicon', color: colors.BLACK, size: 35, component: TouchableWithoutFeedback, onPress: () => { props.navigation.goBack() } }}
                centerComponent={<Text style={styles.headerStyle}>{t('update_profile_title')}</Text>}
                containerStyle={[styles.headerContainerStyle, { marginTop: auth.info.profile.usertype == 'driver' ? 0 : hasNotch ? 0 : -30 }]}
                innerContainerStyles={styles.headerInnerContainer}
            />
            <ScrollView style={styles.scrollViewStyle}>
                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "padding" : "padding"} style={styles.form}>
                    <View style={styles.containerStyle}>

                        <View style={styles.container}>
                            <Text style={styles.text}>{t('first_name_placeholder')}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={profileData && profileData.firstName ? profileData.firstName : ''}
                                onChangeText={(text) => { setProfileData({ ...profileData, firstName: text }) }}
                                editable
                            />
                        </View>

                        <View style={styles.container}>
                            <Text style={styles.text}>{t('last_name_placeholder')}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={profileData && profileData.lastName ? profileData.lastName : ''}
                                onChangeText={(text) => { setProfileData({ ...profileData, lastName: text }) }}
                                editable
                            />
                        </View>

                        <View style={styles.container}>
                            <Text style={styles.text}>{t('email_placeholder')}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={profileData && profileData.email ? profileData.email : ''}
                                onChangeText={(text) => { setProfileData({ ...profileData, email: text }) }}
                                editable={profileData && profileData.loginType == 'social' ? true : false}
                                keyboardType={'email-address'}

                            />
                        </View>

                        <View style={styles.container}>
                            <Text style={styles.text}>{t('mobile_no_placeholder')}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={profileData && profileData.mobile ? profileData.mobile : ''}
                                onChangeText={(text) => { setProfileData({ ...profileData, mobile: text }) }}
                                editable={profileData && profileData.loginType == 'social' ? true : false}
                                keyboardType={'number-pad'}
                            />
                        </View>
                        {/* <View style={styles.gapView} /> */}
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <Button
                    onPress={saveProfile}
                    title={t('update_button')}
                    titleStyle={styles.buttonText}
                    buttonStyle={styles.registerButton}
                />
            </View>
        </View>
    );

}




const styles = StyleSheet.create({
    main: {
        flex: 1
    },
    headerContainerStyle: {
        backgroundColor: colors.TRANSPARENT,
        borderBottomWidth: 0,
        marginTop: -30
    },
    headerInnerContainer: {
        marginLeft: 10,
        marginRight: 10
    },
    inputContainerStyle: {
        borderBottomWidth: 1,
        borderBottomColor: colors.BLACK
    },
    textInputStyle: {
        marginLeft: 10,
    },
    iconContainer: {
        paddingTop: 8
    },
    gapView: {
        height: 40,
        width: '100%'
    },
    buttonContainer: {
        // flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        // borderRadius: 40
        position: 'absolute',
        bottom: 10
    },
    registerButton: {
        backgroundColor: colors.PINK.primary,
        width: '90%',
        height: 45,
        borderColor: colors.TRANSPARENT,
        borderWidth: 0,
        marginTop: 30,
        borderRadius: 8,
        elevation: 0,
        alignSelf: 'center',
        marginBottom: 10,
    },
    buttonTitle: {
        fontSize: 16,
        fontFamily: "Poppins-Medium",
    },
    inputTextStyle: {
        color: colors.BLACK,
        fontSize: 13,
        marginLeft: 0,
        height: 32
    },
    errorMessageStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 0
    },
    containerStyle: {
        flexDirection: 'column',
        marginTop: 20,
    },
    form: {
        flex: 1,
    },
    logo: {
        width: '90%',
        justifyContent: "flex-start",
        marginTop: 10,
        alignItems: 'center',
    },
    scrollViewStyle: {
        height: height
    },
    textInputContainerStyle: {
        flexDirection: 'row',
        alignItems: "center",
        marginLeft: 20,
        marginRight: 20,
        padding: 15,
    },
    headerStyle: {
        fontSize: 18,
        fontFamily: 'Poppins-Regular',
        color: colors.BLUE.primary,
        textAlign: 'center',
        flexDirection: 'row',
        marginTop: 0
    },

    container: {
        flex: 1,
        flexDirection: 'column',
        alignContent: 'stretch',
    },
    text: {
        fontSize: 12,
        color: '#636363',
        textAlign: 'left',
        fontFamily: 'Poppins-Regular',
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15,
    },
    textInput: {
        fontSize: 18,
        color: colors.BLUE.primary,
        textAlign: 'left',
        fontFamily: 'Poppins-Regular',
        marginLeft: 15,
        marginRight: 15,
        paddingBottom: 5,
        borderBottomColor: '#636363', // Add this to specify bottom border color
        borderBottomWidth: 1
    },
    buttonText: {
        paddingHorizontal: 20,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: 'white',
        textAlign: 'center',
    },
});