import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Image,
    TouchableWithoutFeedback,
    Platform,
    Alert,
    TextInput
} from 'react-native';
import Background from './Background';
import { Icon, Button, Header, Input } from 'react-native-elements'
import { colors } from '../common/theme';
var { height } = Dimensions.get('window');
import i18n from 'i18n-js';
import RadioForm from 'react-native-simple-radio-button';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import ActionSheet from "react-native-actions-sheet";
import { FirebaseContext } from 'common/src';

export default function Registration(props) {
    const { t } = i18n;
    const { api, appcat } = useContext(FirebaseContext);
    const {
        countries
    } = api;
    const [state, setState] = useState({
        usertype: 'rider',
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        referralId: '',
        vehicleNumber: '',
        vehicleMake: '',
        vehicleModel: '',
        carType: props.cars && props.cars.length > 0 ? props.cars[0].value : '',
        bankAccount: '',
        bankCode: '',
        bankName: '',
        licenseImage: null,
        other_info: '',
        password: '76567@Pinklady'
    });
    const [role, setRole] = useState(0);
    const [capturedImage, setCapturedImage] = useState(null);
    const [confirmpassword, setConfirmPassword] = useState('76567@Pinklady');
    const [countryCode, setCountryCode] = useState();
    const [mobileWithoutCountry, setMobileWithoutCountry] = useState('');
    const settings = useSelector(state => state.settingsdata.settings);

    const actionSheetRef = useRef(null);

    const radio_props = [
        { label: t('no'), value: 0 },
        { label: t('yes'), value: 1 }
    ];

    const formatCountries = () => {
        let arr = [];
        for (let i = 0; i < countries.length; i++) {
            let txt = countries[i].label + " (+" + countries[i].phone + ")";
            arr.push({ label: txt, value: txt, key: txt });
        }
        return arr;
    }



    useEffect(() => {
        if (settings) {
            for (let i = 0; i < countries.length; i++) {
                if (countries[i].label == settings.country) {
                    setCountryCode(settings.country + " (+" + countries[i].phone + ")");
                }
            }
        }
    }, [settings]);

    const showActionSheet = () => {
        actionSheetRef.current?.setModalVisible(true);
    }

    const uploadImage = () => {
        return (
            <ActionSheet ref={actionSheetRef}>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderColor: colors.GREY.iconPrimary, borderBottomWidth: 1, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('CAMERA', ImagePicker.launchCameraAsync) }}
                >
                    <Text style={{ color: colors.BLUE.greenish_blue, fontWeight: 'bold' }}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderBottomWidth: 1, borderColor: colors.GREY.iconPrimary, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('MEDIA', ImagePicker.launchImageLibraryAsync) }}
                >
                    <Text style={{ color: colors.BLUE.greenish_blue, fontWeight: 'bold' }}>{t('medialibrary')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, height: 50, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { actionSheetRef.current?.setModalVisible(false); }}>
                    <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
            </ActionSheet>
        )
    }

    const _pickImage = async (permissionType, res) => {
        var pickFrom = res;
        let permisions;
        if (permissionType == 'CAMERA') {
            permisions = await ImagePicker.requestCameraPermissionsAsync();
        } else {
            permisions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
        const { status } = permisions;

        if (status == 'granted') {

            let result = await pickFrom({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1.0,
                base64: true
            });

            actionSheetRef.current?.setModalVisible(false);
            if (!result.cancelled) {
                let data = 'data:image/jpeg;base64,' + result.base64;
                setCapturedImage(result.uri);
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function () {
                        Alert.alert(t('alert'), t('image_upload_error'));;
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', Platform.OS == 'ios' ? data : result.uri, true);
                    xhr.send(null);
                });
                if (blob) {
                    setState({ ...state, licenseImage: blob });
                }
            }
        } else {
            Alert.alert(t('alert'), t('camera_permission_error'))
        }
    }

    //upload cancel
    const cancelPhoto = () => {
        setCapturedImage(null);
    }

    const setUserType = (value) => {
        if (value == 0) {
            setState({ ...state, usertype: 'rider' });
        } else {
            setState({ ...state, usertype: 'driver' });
        }
    }

    const validateMobile = () => {
        let mobileValid = true;
        if (mobileWithoutCountry.length < 10) {
            mobileValid = false;
            Alert.alert(t('alert'), t('mobile_no_blank_error'));
        }
        return mobileValid;
    }

    const validatePassword = (complexity) => {
        let passwordValid = true;
        const regx1 = /^([a-zA-Z0-9@*#?.%$!^_+:;/,'"-=~|/`<>{}()]{6,30})$/
        const regx2 = /(?=^.{8,30}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/
        if (complexity == 'any') {
            passwordValid = state.password.length >= 1;
            if (!passwordValid) {
                Alert.alert(t('alert'), t('password_blank_messege'));
            }
        }
        else if (complexity == 'alphanumeric') {
            passwordValid = regx1.test(state.password);
            if (!passwordValid) {
                Alert.alert(t('alert'), t('password_alphaNumeric_check'));
            }
        }
        else if (complexity == 'complex') {
            passwordValid = regx2.test(password);
            if (!passwordValid) {
                Alert.alert(t('alert'), t('password_complexity_check'));
            }
        }
        if (state.password != confirmpassword) {
            passwordValid = false;
            if (!passwordValid) {
                Alert.alert(t('alert'), t('confrim_password_not_match_err'));
            }
        }
        return passwordValid
    }


    //register button press for validation
    const onPressRegister = () => {
        const { onPressRegister } = props;
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (re.test(state.email)) {
            if (state.usertype == 'driver' && state.licenseImage == null) {
                Alert.alert(t('alert'), t('proper_input_licenseimage'));
            } else {
                if ((state.usertype == 'driver' && state.vehicleNumber.length > 1) || state.usertype == 'rider') {
                    if (/\S/.test(state.firstName) && state.firstName.length > 0 && /\S/.test(state.lastName) && state.lastName.length > 0) {
                        if (validatePassword('alphanumeric')) {
                            if (validateMobile()) {
                                const userData = { ...state };
                                if (userData.usertype == 'rider') delete userData.carType;
                                onPressRegister(userData);
                            } else {
                                Alert.alert(t('alert'), t('mobile_no_blank_error'));
                            }
                        }
                    } else {
                        Alert.alert(t('alert'), t('proper_input_name'));
                    }
                } else {
                    Alert.alert(t('alert'), t('proper_input_vehicleno'));
                }
            }
        } else {
            Alert.alert(t('alert'), t('proper_email'));
        }
    }

    const upDateCountry = (text) => {
        setCountryCode(text);
        let extNum = text.split("(")[1].split(")")[0];
        let formattedNum = mobileWithoutCountry.replace(/ /g, '');
        formattedNum = extNum + formattedNum.replace(/-/g, '');
        setState({ ...state, mobile: formattedNum })
    }

    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.TRANSPARENT}
                leftComponent={{ icon: 'ios-arrow-back', type: 'ionicon', color: colors.BLUE.primary, size: 35, component: TouchableWithoutFeedback, onPress: props.onPressBack }}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('registration_title')}</Text>}
                containerStyle={[{ marginTop: 0 }]}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <KeyboardAvoidingView style={styles.form} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView style={styles.scrollViewStyle} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
                    {
                        uploadImage()
                    }
                    <TouchableOpacity activeOpacity={1} style={styles.form}>
                        <View style={styles.containerStyle}>
                            {/* <Text style={styles.headerStyle}>{t('registration_title')}</Text> */}

                            <View style={styles.container}>
                                <Text style={styles.text}>{t('first_name_placeholder')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={state.firstName}
                                    onChangeText={(text) => { setState({ ...state, firstName: text }) }}
                                    editable
                                />
                            </View>

                            <View style={styles.container}>
                                <Text style={styles.text}>{t('last_name_placeholder')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={state.lastName}
                                    onChangeText={(text) => { setState({ ...state, lastName: text }) }}
                                    editable
                                />
                            </View>

                            <View style={styles.container}>
                                <Text style={styles.text}>{t('email_placeholder')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={state.email}
                                    onChangeText={(text) => { setState({ ...state, email: text }) }}
                                    keyboardType={'email-address'}
                                    editable
                                />
                            </View>

                            {/* <View style={styles.textInputContainerStyle}>
                                <Icon
                                    name='lock'
                                    type='font-awesome'
                                    color={colors.BLUE.primary}
                                    size={24}
                                    containerStyle={styles.iconContainer}
                                />
                                <Input
                                    underlineColorAndroid={colors.TRANSPARENT}
                                    placeholder={t('password_placeholder')}
                                    placeholderTextColor={colors.BLUE.primary}
                                    value={state.password}
                                    inputStyle={styles.inputTextStyle}
                                    onChangeText={(text) => setState({ ...state, password: text })}
                                    inputContainerStyle={styles.inputContainerStyle}
                                    containerStyle={styles.textInputStyle}
                                    secureTextEntry={true}
                                />
                            </View>
                            <View style={styles.textInputContainerStyle}>
                                <Icon
                                    name='lock'
                                    type='font-awesome'
                                    color={colors.BLUE.primary}
                                    size={24}
                                    containerStyle={styles.iconContainer}
                                />
                                <Input
                                    underlineColorAndroid={colors.TRANSPARENT}
                                    placeholder={t('confrim_password_placeholder')}
                                    placeholderTextColor={colors.BLUE.primary}
                                    value={confirmpassword}
                                    inputStyle={styles.inputTextStyle}
                                    onChangeText={(text) => setConfirmPassword(text)}
                                    inputContainerStyle={styles.inputContainerStyle}
                                    containerStyle={styles.textInputStyle}
                                    secureTextEntry={true}
                                />
                            </View> */}

                            {/* <View style={[styles.textInputContainerStyle, { marginBottom: 10 }]}>
                            <Icon
                                name='mobile-phone'
                                type='font-awesome'
                                color={colors.BLUE.primary}
                                size={36}
                                containerStyle={[styles.iconContainer, { marginTop: 15 }]}
                            />

                            <RNPickerSelect
                                key={countryCode}
                                placeholder={{ label: t('select_country'), value: t('select_country') }}
                                value={countryCode}
                                useNativeAndroidPickerStyle={false}
                                style={{
                                    inputIOS: styles.pickerStyle,
                                    placeholder: {
                                        color: 'white'
                                    },
                                    inputAndroid: styles.pickerStyle
                                }}
                                onValueChange={(text) => { upDateCountry(text); }}
                                items={formatCountries()}
                                disabled={settings.AllowCountrySelection ? false : true}
                                Icon={() => { return <Ionicons style={{ top: 15 }} name="md-arrow-down" size={24} color="gray" />; }}

                            />
                        </View> */}

                            <View style={styles.container}>
                                <Text style={styles.text}>{t('mobile_no_placeholder')}</Text>
                                <View style={{
                                    flexDirection: 'row',
                                    borderBottomWidth: 1,
                                    borderBottomColor: colors.BLUE.primary,
                                    marginHorizontal: 15,
                                    alignItems: 'center',
                                    marginTop: Platform.OS == "ios" ? 5 : 0,
                                }}>
                                    <Text style={styles.pickerStyleText}>+91</Text>
                                    <TextInput
                                        style={{ ...styles.textInput, flex: 1, borderBottomWidth: Platform.OS == "ios" ? 1 : 0, borderBottomColor: colors.WHITE, marginLeft: 5, marginTop: 0 }}
                                        value={mobileWithoutCountry}
                                        onChangeText={
                                            (text) => {
                                                setMobileWithoutCountry(text)
                                                let formattedNum = text.replace(/ /g, '');
                                                formattedNum = countryCode.split("(")[1].split(")")[0] + formattedNum.replace(/-/g, '');
                                                setState({ ...state, mobile: formattedNum })
                                            }
                                        }
                                        keyboardType={'number-pad'}
                                        maxLength={10}
                                        editable
                                    />
                                </View>
                            </View>

                            <View style={styles.container}>
                                <Text style={styles.text}>{t('referral_id_placeholder')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={state.referralId}
                                    onChangeText={(text) => { setState({ ...state, referralId: text }) }}
                                    editable
                                />
                            </View>

                            <View style={styles.container}>
                                <Text style={styles.text}>{t('register_as_driver')}</Text>
                                {/* <View style={{ alignItems: 'center' }}> */}
                                <RadioForm
                                    radio_props={radio_props}
                                    initial={role}
                                    formHorizontal={true}
                                    labelHorizontal={true}
                                    buttonColor={colors.BLUE.primary}
                                    labelColor={colors.BLUE.primary}
                                    style={{ marginLeft: 15, marginTop: 10 }}
                                    labelStyle={{ marginRight: 15 }}
                                    selectedButtonColor={colors.BLUE.primary}
                                    selectedLabelColor={colors.BLUE.primary}
                                    onPress={(value) => {
                                        setRole(value);
                                        setUserType(value);
                                    }}
                                />
                                {/* </View> */}
                            </View>
                            {state.usertype == 'driver' ?
                                <View style={styles.container}>
                                    <Text style={styles.text}>Select Car Type </Text>
                                    {props.cars ?
                                        <RNPickerSelect
                                            placeholder={{}}
                                            value={state.carType}
                                            useNativeAndroidPickerStyle={false}
                                            style={{
                                                inputIOS: styles.pickerStyle,
                                                placeholder: {
                                                    color: 'white'
                                                },
                                                inputAndroid: styles.pickerStyle
                                            }}
                                            onValueChange={(value) => setState({ ...state, carType: value })}
                                            items={props.cars}
                                            Icon={() => { return <Ionicons style={{ top: 5, marginRight: 10 }} name="md-arrow-down" size={24} color={colors.BLUE.primary} />; }}
                                        />
                                        : null}
                                </View>
                                : null}

                            {state.usertype == 'driver' ?
                                <View style={styles.container}>
                                    <Text style={styles.text}>{t('vehicle_model_name')}</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={state.vehicleMake}
                                        onChangeText={(text) => { setState({ ...state, vehicleMake: text }) }}
                                        editable
                                    />
                                </View>
                                : null}

                            {state.usertype == 'driver' ?
                                <View style={styles.container}>
                                    <Text style={styles.text}>{t('vehicle_model_no')}</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={state.vehicleModel}
                                        onChangeText={(text) => { setState({ ...state, vehicleModel: text }) }}
                                        editable
                                    />
                                </View>
                                : null}

                            {state.usertype == 'driver' ?
                                <View style={styles.container}>
                                    <Text style={styles.text}>{t('vehicle_reg_no')}</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={state.vehicleNumber}
                                        onChangeText={(text) => { setState({ ...state, vehicleNumber: text }) }}
                                        editable
                                    />
                                </View>
                                : null}

                            {state.usertype == 'driver' ?
                                <View style={styles.container}>
                                    <Text style={styles.text}>{t('bankName')}</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={state.bankName}
                                        onChangeText={(text) => { setState({ ...state, bankName: text }) }}
                                        editable
                                    />
                                </View>
                                : null}

                            {state.usertype == 'driver' ?
                                <View style={styles.container}>
                                    <Text style={styles.text}>{t('bankCode')}</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={state.bankCode}
                                        onChangeText={(text) => { setState({ ...state, bankCode: text }) }}
                                        editable
                                    />
                                </View>
                                : null}

                            {state.usertype == 'driver' ?
                                <View style={styles.container}>
                                    <Text style={styles.text}>{t('bankAccount')}</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={state.bankAccount}
                                        onChangeText={(text) => { setState({ ...state, bankAccount: text }) }}
                                        editable
                                    />
                                </View>
                                : null}

                            {state.usertype == 'driver' ?
                                capturedImage ?
                                    <View style={styles.imagePosition}>
                                        <TouchableOpacity style={styles.photoClick} onPress={cancelPhoto}>
                                            <Image source={require('../../assets/images/cross.png')} resizeMode={'contain'} style={styles.imageStyle} />
                                        </TouchableOpacity>
                                        <Image source={{ uri: capturedImage }} style={styles.photoResult} resizeMode={'cover'} />
                                    </View>
                                    :
                                    <View style={styles.capturePhoto}>
                                        <View>
                                            {
                                                state.imageValid ?
                                                    <Text style={styles.capturePhotoTitle}>{t('upload_driving_license')}</Text>
                                                    :
                                                    <Text style={styles.errorPhotoTitle}>{t('upload_driving_license')}</Text>
                                            }

                                        </View>
                                        <View style={styles.capturePicClick}>
                                            <TouchableOpacity style={styles.flexView1} onPress={showActionSheet}>
                                                <View>
                                                    <View style={styles.imageFixStyle}>
                                                        <Image source={require('../../assets/images/camera.png')} resizeMode={'contain'} style={styles.imageStyle2} />
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                            <View style={styles.myView}>
                                                <View style={styles.myView1} />
                                            </View>
                                            <View style={styles.myView2}>
                                                <View style={styles.myView3}>
                                                    <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                : null}

                            <View style={styles.buttonContainer}>
                                <Button
                                    onPress={onPressRegister}
                                    title={t('register_button')}
                                    loading={props.loading}
                                    titleStyle={styles.buttonTitle}
                                    buttonStyle={styles.registerButton}
                                />
                            </View>
                            <View style={styles.gapView} />

                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = {
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE
    },
    headerContainerStyle: {
        backgroundColor: colors.TRANSPARENT,
        borderBottomWidth: 0,
        marginTop: 0
    },
    headerInnerContainer: {
        marginLeft: 10,
        marginRight: 10
    },
    headerTitleStyle: {
        color: colors.BLUE.primary,
        fontFamily: 'Poppins-Bold',
        fontSize: 20
    },
    inputContainerStyle: {
        borderBottomWidth: 1,
        borderBottomColor: colors.BLUE.primary
    },
    textInputStyle: {
        marginLeft: 10,
    },
    iconContainer: {
        paddingBottom: 20
    },
    gapView: {
        height: 40,
        width: '100%'
    },
    buttonContainer: {
        justifyContent: 'center',
        width: '100%',
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
    pickerStyle: {
        color: colors.BLUE.primary,
        fontSize: 15,
        height: 40,
        marginHorizontal: 15,
        marginTop: Platform.OS == 'ios' ? 0 : -5,
        borderBottomWidth: 1,
        borderBottomColor: colors.BLUE.primary,
    },
    pickerStyleText: {
        fontSize: 18,
        color: colors.BLUE.primary,
        textAlign: 'left',
        fontFamily: 'Poppins-Regular',
        // marginLeft: 15,
        // paddingRight: 5,
        // borderBottomWidth: 1,
        // borderBottomColor: colors.BLUE.primary,

    },
    inputTextStyle: {
        color: colors.BLUE.primary,
        fontSize: 13,
        marginLeft: 0,
        height: 32,
    },
    errorMessageStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 0
    },
    containerStyle: {
        flexDirection: 'column',
        marginTop: 20
    },
    form: {
        flex: 1,
    },
    logo: {
        width: '100%',
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
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
    },
    headerStyle: {
        fontSize: 18,
        color: colors.BLUE.primary,
        textAlign: 'center',
        flexDirection: 'row',
        marginTop: 0
    },

    capturePhoto: {
        width: '80%',
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: colors.BLUE.primary,
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 10,
        marginTop: 15
    },
    capturePhotoTitle: {
        color: colors.BLACK,
        fontSize: 14,
        textAlign: 'center',
        paddingBottom: 15,

    },
    errorPhotoTitle: {
        color: colors.RED,
        fontSize: 13,
        textAlign: 'center',
        paddingBottom: 15,
    },
    photoResult: {
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 10,
        marginTop: 15,
        width: '80%',
        height: height / 4
    },
    imagePosition: {
        position: 'relative'
    },
    photoClick: {
        paddingRight: 48,
        position: 'absolute',
        zIndex: 1,
        marginTop: 18,
        alignSelf: 'flex-end'
    },
    capturePicClick: {
        backgroundColor: colors.BLUE.primary,
        flexDirection: 'row',
        position: 'relative',
        zIndex: 1
    },
    imageStyle: {
        width: 30,
        height: height / 15
    },
    flexView1: {
        flex: 12
    },
    imageFixStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageStyle2: {
        width: 150,
        height: height / 15
    },
    myView: {
        flex: 2,
        height: 50,
        width: 1,
        alignItems: 'center'
    },
    myView1: {
        height: height / 18,
        width: 1.5,
        backgroundColor: colors.GREY.btnSecondary,
        alignItems: 'center',
        marginTop: 10
    },
    myView2: {
        flex: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    myView3: {
        flex: 2.2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textStyle: {
        color: colors.GREY.btnPrimary,
        fontFamily: 'Poppins-Bold',
        fontSize: 13
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
        marginTop: Platform.OS == "ios" ? 5 : 0,
        // paddingBottom: 5,
        borderBottomColor: colors.BLUE.primary, // Add this to specify bottom border color
        borderBottomWidth: 1
    },
}
