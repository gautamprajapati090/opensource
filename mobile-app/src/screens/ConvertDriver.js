import React, { useEffect, useContext, useState, useRef } from 'react';
import { colors } from '../common/theme';
import { useSelector, useDispatch } from 'react-redux';
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
    StyleSheet,
    TextInput
} from 'react-native';
import { Icon, Button, Header, Input } from 'react-native-elements'
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import { FirebaseContext } from 'common/src';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActionSheet from "react-native-actions-sheet";
import i18n from 'i18n-js';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { hasNotch } from '../common/utility';

var { height, width } = Dimensions.get('window');

export default function ConvertDriver(props) {
    const { t } = i18n;
    const { api, appcat } = useContext(FirebaseContext);
    const settings = useSelector(state => state.settingsdata.settings);
    const dispatch = useDispatch();
    const {
        signOut,
        updateProfile
    } = api;
    const [state, setState] = useState({
        usertype: 'driver',
        vehicleNumber: '',
        vehicleMake: '',
        vehicleModel: '',
        carType: null,
        bankAccount: '',
        bankCode: '',
        bankName: '',
        licenseImage: null,
        other_info: '',
        queue: false,
        driverActiveStatus: true
    });
    const cars = useSelector(state => state.cartypes.cars);
    const auth = useSelector(state => state.auth);
    const settingsdata = useSelector(state => state.settingsdata);
    const [carTypes, setCarTypes] = useState(null);
    const [loading, setLoading] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const actionSheetRef = useRef(null);

    useEffect(() => {
        if (auth.info && auth.info.profile && auth.info.profile.licenseImage) {
            setLoading(false);
            props.navigation.navigate('Intro');
            dispatch(signOut());
        }
    }, [auth.info]);

    useEffect(() => {
        if (cars) {
            let arr = [];
            for (let i = 0; i < cars.length; i++) {
                arr.push({ label: cars[i].name, value: cars[i].name });
            }
            if (arr.length > 0) {
                setState({ ...state, carType: arr[0].value })
            }
            setCarTypes(arr);
        }
    }, [cars]);

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
                    <Text style={{ color: 'red', fontWeight: 'bold' }}>{t('cancel')}</Text>
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
                base64: true,
                quality: 1.0
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
                        Alert.alert(t('alert'), t('image_upload_error'));
                        setLoader(false);
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

    //register button press for validation
    const onPressRegister = () => {
        if (state.licenseImage == null) {
            Alert.alert(t('alert'), t('proper_input_licenseimage'));
        } else {
            if (state.vehicleNumber.length > 1) {
                setLoading(true);
                dispatch(updateProfile(auth.info, { ...state, approved: !settingsdata.settings.driver_approval }));
            } else {
                Alert.alert(t('alert'), t('proper_input_vehicleno'));
            }
        }
    }

    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.GREY.default}
                leftComponent={{ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } }}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('convert_to_driver')}</Text>}
                containerStyle={[styles.headerStyle, { marginTop: auth.info.profile.usertype == 'driver' ? 0 : hasNotch ? 0 : -30 }]}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <KeyboardAvoidingView style={styles.form} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView style={styles.scrollViewStyle} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
                    {
                        uploadImage()
                    }
                    <TouchableOpacity activeOpacity={1}  style={styles.form}>
                        <View style={styles.containerStyle}>

                            <Text style={styles.text}>Select Car Type </Text>
                            {carTypes ?
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
                                    items={carTypes}
                                    Icon={() => { return <Ionicons style={{ top: 5, marginRight: 10 }} name="md-arrow-down" size={24} color={colors.BLUE.primary} />; }}
                                />
                                : null}

                            <View style={styles.viewContainer}>
                                <Text style={styles.text}>{t('vehicle_model_name')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={state.vehicleMake}
                                    onChangeText={(text) => { setState({ ...state, vehicleMake: text }) }}
                                    editable
                                />
                            </View>

                            <View style={styles.viewContainer}>
                                <Text style={styles.text}>{t('vehicle_model_no')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={state.vehicleModel}
                                    onChangeText={(text) => { setState({ ...state, vehicleModel: text }) }}
                                    editable
                                />
                            </View>

                            <View style={styles.viewContainer}>
                                <Text style={styles.text}>{t('vehicle_reg_no')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={state.vehicleNumber}
                                    onChangeText={(text) => { setState({ ...state, vehicleNumber: text }) }}
                                    editable
                                />
                            </View>

                            <View style={styles.viewContainer}>
                                <Text style={styles.text}>{t('other_info')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={state.other_info}
                                    onChangeText={(text) => { setState({ ...state, other_info: text }) }}
                                    editable
                                />
                            </View>

                            {settings.bank_fields ?
                                <View style={styles.viewContainer}>
                                    <Text style={styles.text}>{t('bankName')}</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={state.bankName}
                                        onChangeText={(text) => { setState({ ...state, bankName: text }) }}
                                        editable
                                    />
                                </View>
                                : null}

                            {settings.bank_fields ?
                                <View style={styles.viewContainer}>
                                    <Text style={styles.text}>{t('bankCode')}</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={state.bankCode}
                                        onChangeText={(text) => { setState({ ...state, bankCode: text }) }}
                                        editable
                                    />
                                </View>
                                : null}

                            {settings.bank_fields ?
                                <View style={styles.viewContainer}>
                                    <Text style={styles.text}>{t('bankAccount')}</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={state.bankAccount}
                                        onChangeText={(text) => { setState({ ...state, bankAccount: text }) }}
                                        editable
                                    />
                                </View>
                                : null}

                            {capturedImage ?
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
                            }
                            <View style={styles.buttonContainer}>
                                <Button
                                    onPress={onPressRegister}
                                    title={t('convert_button')}
                                    loading={loading}
                                    titleStyle={styles.buttonTitle}
                                    buttonStyle={styles.registerButton}
                                />
                            </View>
                            <View style={styles.gapView} />
                        </View>
                    </TouchableOpacity >
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );

}

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: colors.PINK.default,
        borderBottomWidth: 0,
        marginTop: -30
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Poppins-Bold',
        fontSize: 20
    },
    containerView: { flex: 1 },
    textContainer: { textAlign: "center" },
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
    inputContainerStyle: {
        borderBottomWidth: 1,
        borderBottomColor: colors.BLACK
    },
    textInputStyle: {
        width: width - 60
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
        color: colors.BLACK,
        // width: 200,
        fontSize: 15,
        height: 40,
        marginHorizontal: 15,
        marginTop: Platform.OS == 'ios' ? 8 : -5,
        borderBottomWidth: 1,
        borderBottomColor: '#636363',
    },
    inputTextStyle: {
        color: colors.BLACK,
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
        marginTop: 0
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
        width: width - 40
    },
    // headerStyle: {
    //     fontSize: 18,
    //     color: colors.WHITE,
    //     textAlign: 'center',
    //     flexDirection: 'row',
    //     marginTop: 0
    // },

    capturePhoto: {
        width: '80%',
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: colors.PINK.primary,
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 10,
        marginTop: 15
    },
    capturePhotoTitle: {
        color: colors.WHITE,
        fontSize: 13,
        fontFamily: "Poppins-Regular",
        textAlign: 'center',
        paddingBottom: 15,

    },
    errorPhotoTitle: {
        color: colors.WHITE,
        fontSize: 12,
        fontFamily: "Poppins-Regular",
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
        backgroundColor: colors.PINK.primary,
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
        backgroundColor: colors.WHITE,
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
        color: colors.WHITE,
        fontFamily: 'Poppins-Bold',
        fontSize: 13
    },
    actionText: {
        fontSize: 16,
        fontFamily: "Poppins-Regular",
        fontWeight: 'bold',
        color: colors.BLUE.greenish_blue
    },

    viewContainer: {
        flex: 1,
        flexDirection: 'column',
        alignContent: 'stretch',
    },
    text: {
        fontSize: 12,
        color: '#636363',
        textAlign: 'left',
        fontFamily: 'Poppins-Regular',
        marginHorizontal: 15,
        marginTop: 15,
    },
    text2: {
        flex: 5,
        fontSize: 18,
        color: '#01184e',
        textAlign: 'left',
        fontFamily: 'Poppins-Regular',
        marginLeft: 10,
        marginRight: 10,
    },
    arrowButton: {
        flex: 1,
        fontSize: 26,
        textAlign: 'right',
        marginRight: 10,
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
});