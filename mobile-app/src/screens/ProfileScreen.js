import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Alert,
    Switch,
    Platform,
    Share
} from 'react-native';
import { Entypo, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Icon, Header } from 'react-native-elements';
import ActionSheet from "react-native-actions-sheet";
import { colors } from '../common/theme';
import * as ImagePicker from 'expo-image-picker';
import i18n from 'i18n-js';
var { width, height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { FirebaseContext } from 'common/src';
import StarRating from 'react-native-star-rating';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';
import RNPickerSelect from 'react-native-picker-select';
import moment from 'moment/min/moment-with-locales';
import { hasNotch } from '../common/utility';

export default function ProfileScreen(props) {
    const { t } = i18n;
    const { api } = useContext(FirebaseContext);
    const {
        updateProfileImage,
        signOut,
        deleteUser,
        updateProfile,
        clearTripPoints
    } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const [profileData, setProfileData] = useState(null);
    const [loader, setLoader] = useState(false);

    const actionSheetRef = useRef(null);

    const [langSelection, setLangSelection] = useState();
    const languagedata = useSelector(state => state.languagedata);



    useEffect(() => {
        setLangSelection(i18n.locale);
    }, []);

    const LOCATION_TASK_NAME = 'background-location-task';

    useEffect(() => {
        if (auth.info && auth.info.profile) {
            setProfileData(auth.info.profile);
        }
    }, [auth.info]);

    const onChangeFunction = () => {
        let res = !profileData.driverActiveStatus;
        dispatch(updateProfile(auth.info, { driverActiveStatus: res }));
    }

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
                    <Text style={{ color: colors.BLUE.primary, fontWeight: 'bold' }}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderBottomWidth: 1, borderColor: colors.GREY.iconPrimary, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('MEDIA', ImagePicker.launchImageLibraryAsync) }}
                >
                    <Text style={{ color: colors.BLUE.primary, fontWeight: 'bold' }}>{t('medialibrary')}</Text>
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
            setLoader(true);
            let result = await pickFrom({
                allowsEditing: true,
                aspect: [3, 3],
                base64: true
            });
            actionSheetRef.current?.setModalVisible(false);
            if (!result.cancelled) {
                let data = 'data:image/jpeg;base64,' + result.base64;
                setProfileData({
                    ...profileData,
                    profile_image: result.uri
                })
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
                    dispatch(updateProfileImage(auth.info, blob));
                }
                setLoader(false);
            }
            else {
                setLoader(false);
            }
        } else {
            Alert.alert(t('alert'), t('camera_permission_error'))
        }
    };


    const editProfile = () => {
        props.navigation.push('editUser');
    }

    const StopBackgroundLocation = async () => {
        dispatch(updateProfile(auth.info, { driverActiveStatus: false }));
        TaskManager.getRegisteredTasksAsync().then((res) => {
            if (res.length > 0) {
                for (let i = 0; i < res.length; i++) {
                    if (res[i].taskName == LOCATION_TASK_NAME) {
                        Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                        break;
                    }
                }
            }
        });
    }

    //sign out and clear all async storage
    const logOff = () => {
        auth.info && auth.info.profile && auth.info.profile.usertype == 'rider' ? dispatch(clearTripPoints()) : null;
        auth.info && auth.info.profile && auth.info.profile.usertype == 'driver' ? StopBackgroundLocation() : null;
        props.navigation.navigate('Intro');
        setTimeout(() => {
            dispatch(signOut());
        }, 1000);
    }

    //Delete current user
    const deleteAccount = () => {
        Alert.alert(
            t('delete_account_modal_title'),
            t('delete_account_modal_subtitle'),
            [
                {
                    text: t('cancel'),
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: t('yes'), onPress: () => {
                        props.navigation.navigate('Intro');
                        dispatch(deleteUser(auth.info.uid));
                    }
                },
            ],
            { cancelable: false },
        );
    }

    const goWallet = () => {
        props.navigation.navigate('wallet');
    }

    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.GREY.default}
                leftComponent={{ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } }}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('profile_page_title')}</Text>}
                // containerStyle={styles.headerStyle}
                containerStyle={[styles.headerStyle, { marginTop: auth.info.profile.usertype == 'driver' ? 0 : hasNotch ? 0 : -30 }]}

                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            // rightComponent={languagedata && languagedata.json? 
            //     <View style={{ flexDirection:'row', height: 30, alignItems:'center'}}>
            //         <Text style={{color:colors.WHITE}}>Lang:</Text>
            //         {langSelection?
            //         <RNPickerSelect
            //             placeholder={{}}
            //             value={langSelection}
            //             useNativeAndroidPickerStyle={true}
            //             style={{
            //                 inputIOS: styles.pickerStyle,
            //                 inputAndroid: styles.pickerStyle,
            //                 placeholder: {
            //                     color: colors.WHITE
            //                 },

            //             }}
            //             onValueChange={
            //                 (text) => {
            //                     setLangSelection(text);
            //                     i18n.locale = text;
            //                     moment.locale(text);
            //                     AsyncStorage.setItem('language',text);
            //                 }
            //             }
            //             label={"Language"}
            //             items={Object.keys(languagedata.json).map(function(key){return {label :key, value: key};})}
            //             Icon={() => {return <Ionicons style={{marginTop:4}} name="md-arrow-down" size={20} color="white" />;}}
            //         />
            //         :null}
            //     </View>
            //     :null
            // }                
            />
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollStyle}>
                {
                    uploadImage()
                }
                {/* {profileData && profileData.usertype == 'driver' ?
                    <View style={styles.scrollViewStyle1} >
                        <Text style={styles.profStyle}>{t('active_status')}</Text>
                        <Switch
                            style={styles.switchAlignStyle}
                            value={profileData ? profileData.driverActiveStatus : false}
                            onValueChange={onChangeFunction}
                        />
                    </View>
                    : null} */}

                <View style={styles.container}>

                    {
                        loader ?
                            <View style={{ alignItems: 'center', justifyContent: 'space-around', marginTop: 10 }}>
                                <ActivityIndicator size="large" color={colors.BLUE.secondary} />
                            </View>
                            : <View style={{ alignItems: 'center', justifyContent: 'space-around', marginTop: 10 }}>
                                <Image source={profileData && profileData.profile_image ? { uri: profileData.profile_image } : require('../../assets/images/profilePic.png')}
                                    style={styles.profileIcon} />
                                {/* image picker */}
                                <TouchableOpacity
                                    activeOpacity={.5}
                                    onPress={showActionSheet}
                                    style={styles.icon}
                                >
                                    <Entypo name="camera" color="#fff" size={18} />
                                    {/* <MaterialCommunityIcons style={styles.icon2} name="image-edit" size={20} color="#fff" /> */}
                                </TouchableOpacity>

                            </View>
                    }

                    <Text style={styles.text}> Name </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.text2}> {profileData && profileData.firstName.toUpperCase() + " " + profileData.lastName.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.text}> Phone Number </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.text2}> {profileData ? profileData.mobile : ''} </Text>
                        <Text style={styles.textVerified}> verified </Text>
                    </View>
                    <Text style={styles.text}> Email </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.text2} numberOfLines={1}> {profileData ? profileData.email : ''} </Text>
                        {/* {this.state.is_email_verify == "no" ?
                            <Text style={styles.textVerify} onPress={() => this.props.navigation.navigate('SubProfileEmailScreen')}> verify </Text>
                            :
                            <Text style={styles.textVerified}> verified </Text>
                        } */}
                    </View>
                    {profileData && profileData.referralId ?
                        <>
                            <Text style={styles.text}> {t('referralId')} </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.text2} numberOfLines={1}> {profileData.referralId} </Text>
                                <TouchableOpacity
                                    style={{ flex: 1 }}
                                    activeOpacity={.5}
                                    onPress={() => {
                                        settings.bonus > 0 ?
                                            Share.share({
                                                message: t('share_msg') + settings.code + ' ' + settings.bonus + ".\n" + t('code_colon') + auth.info.profile.referralId + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
                                            })
                                            :
                                            Share.share({
                                                message: t('share_msg_no_bonus') + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
                                            })
                                    }}
                                >
                                    <AntDesign style={styles.arrowButton} name="sharealt" color="#01184e" size={24} />
                                </TouchableOpacity>
                            </View>
                        </>
                        : null}
                    <Text style={styles.text}> {t('usertype')} </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.text2} numberOfLines={1}> {profileData ? t(profileData.usertype) : ''} </Text>
                    </View>
                    {profileData && profileData.usertype == 'driver' ?
                        <>
                            <Text style={styles.text}> {t('car_type')} </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.text2} numberOfLines={1}> {profileData && profileData.carType ? profileData.carType : ''} </Text>
                            </View>
                        </> : null}
                    {/* <Text style={styles.text}> Gender </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.text2}> {this.state.gender} </Text>
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            activeOpacity={.5}
                            onPress={() => this.props.navigation.navigate('SubProfileGenderScreen')}
                        >
                            <AntDesign style={styles.arrowButton} name="right" color="#01184e" size={24} />
                        </TouchableOpacity>
                    </View> */}

                    {/* <Text style={styles.text}> Emergency Contacts </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.text2} numberOfLines={1}> {this.state.emergency_contact} </Text>
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            activeOpacity={.5}
                            onPress={() => this.props.navigation.navigate('EmergencyContactScreen')}
                        >
                            <AntDesign style={styles.arrowButton} name="right" color="#01184e" size={24} />
                        </TouchableOpacity>
                    </View> */}
                    {profileData && profileData.usertype == 'driver' ?
                        <>
                            <Text style={styles.text}> {t('you_rated_text')} </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.text2} numberOfLines={1}> {profileData && profileData.usertype && profileData.ratings ? profileData.ratings.userrating : 0} </Text>
                                <StarRating
                                    disabled={false}
                                    maxStars={5}
                                    starSize={15}
                                    fullStar={'ios-star'}
                                    halfStar={'ios-star-half'}
                                    emptyStar={'ios-star-outline'}
                                    iconSet={'Ionicons'}
                                    fullStarColor={colors.YELLOW.primary}
                                    emptyStarColor={colors.YELLOW.primary}
                                    halfStarColor={colors.YELLOW.primary}
                                    rating={profileData && profileData.usertype && profileData.ratings ? parseFloat(profileData.ratings.userrating) : 0}
                                    containerStyle={styles.contStyle}
                                />
                            </View>
                        </>
                        : null}

                </View>

                <View style={styles.flexView3}>

                    {profileData && profileData.usertype == 'driver' ?
                        <View style={styles.textIconStyle2} >
                            <Text style={styles.text2}> {t('active_status')}</Text>
                            <Switch
                                thumbColor={Platform.OS == "android" ? auth.info.profile.driverActiveStatus ? colors.BLUE.primary : "#f4f3f4" : "white"}
                                style={{ marginRight: Platform.OS == "android" ? 5 : 10 }}
                                value={profileData ? profileData.driverActiveStatus : false}
                                onValueChange={onChangeFunction}
                            />
                        </View>
                        : null}

                    <TouchableOpacity style={styles.textIconStyle2} onPress={editProfile}>
                        <Text style={styles.text2}> Edit Profile </Text>
                        <MaterialCommunityIcons style={styles.arrowButton} name="account-edit-outline" size={25} color={colors.BLUE.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.textIconStyle2} onPress={deleteAccount}>
                        <Text style={styles.text2}> {t('delete_account_lebel')} </Text>
                        <MaterialCommunityIcons style={styles.arrowButton} name="delete-outline" size={25} color={colors.BLUE.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.textIconStyle2} onPress={logOff}>
                        <Text style={styles.text2}> {t('logout')} </Text>
                        <MaterialCommunityIcons style={styles.arrowButton} name="logout" size={25} color={colors.BLUE.primary} />
                    </TouchableOpacity>

                </View>

            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: colors.PINK.default,
        borderBottomWidth: 0,
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Poppins-Bold',
        fontSize: 20
    },
    logo: {
        flex: 1,
        position: 'absolute',
        top: 110,
        width: '100%',
        justifyContent: "flex-end",
        alignItems: 'center'
    },
    footer: {
        flex: 1,
        position: 'absolute',
        bottom: 0,
        height: 150,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    scrollStyle: {
        flex: 1,
        height: height,
        backgroundColor: colors.WHITE
    },
    scrollViewStyle1: {
        width: width,
        height: 50,
        marginTop: 20,
        backgroundColor: colors.GREY.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    scrollViewStyle: {
        width: width,
        height: 50,
        marginTop: 30,
        backgroundColor: colors.GREY.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    profStyle: {
        fontSize: 18,
        left: 20,
        fontWeight: 'bold',
        color: colors.GREY.btnPrimary,
        fontFamily: 'Poppins-Bold'
    },
    bonusAmount: {
        right: 20,
        fontSize: 16,
        fontWeight: 'bold'
    },
    viewStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 13
    },
    imageParentView: {
        borderRadius: 150 / 2,
        width: 150,
        height: 150,
        backgroundColor: colors.GREY.secondary,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageViewStyle: {
        borderRadius: 140 / 2,
        width: 140,
        height: 140,
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textPropStyle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: colors.GREY.iconSecondary,
        fontFamily: 'Poppins-Bold',
        top: 8,
        textTransform: 'uppercase'
    },
    newViewStyle: {
        flex: 1,
        marginTop: 10
    },
    myViewStyle: {
        flex: 1,
        left: 20,
        marginRight: 40,
        marginBottom: 8,
        borderBottomColor: colors.GREY.btnSecondary,
        borderBottomWidth: 1
    },
    iconViewStyle: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center'
    },
    emailStyle: {
        fontSize: 17,
        left: 10,
        color: colors.GREY.btnPrimary,
        fontFamily: 'Poppins-Bold'
    },
    emailAdressStyle: {
        fontSize: 15,
        color: colors.GREY.secondary,
        fontFamily: 'Poppins-Regular'
    },
    mainIconView: {
        flex: 1,
        left: 20,
        marginRight: 40,
        borderBottomColor: colors.GREY.iconSecondary,
        borderBottomWidth: 1
    },
    text1: {
        fontSize: 17,
        left: 10,
        color: colors.GREY.btnPrimary,
        fontFamily: 'Poppins-Bold'
    },
    text2: {
        fontSize: 15,
        left: 10,
        color: colors.BLUE.primary,
        fontFamily: 'Poppins-Regular'
    },
    textIconStyle: {
        width: width,
        height: 50,
        backgroundColor: colors.GREY.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textIconStyle2: {
        width: width,
        height: 50,
        marginTop: 10,
        backgroundColor: colors.GREY.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight 
    },
    flexView1: {
        flex: 1
    },
    flexView2: {
        flex: 1
    },
    flexView3: {
        marginTop: 10
    },
    loadingcontainer: {
        flex: 1,
        justifyContent: 'center'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    contStyle: {
        width: 90,
        marginHorizontal: 10
    },
    pickerStyle: {
        color: colors.WHITE,
        width: 50,
        fontSize: 20,
        height: 30,
        marginLeft: 3,
        alignContent: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    },

    container: {
        flex: 1,
        flexDirection: 'column',
        alignContent: 'stretch',
        backgroundColor: '#fff',
    },
    textMenu: {
        alignSelf: 'center',
        marginBottom: 10,
        marginLeft: 10,
        fontFamily: 'Poppins-Regular',
        fontSize: 18,
        color: '#01184e'
    },
    text: {
        fontSize: 12,
        color: '#636363',
        textAlign: 'left',
        fontFamily: 'Poppins-Regular',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
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
    textVerify: {
        flex: 1,
        fontSize: 12,
        color: colors.RED,
        textAlign: 'right',
        fontFamily: 'Poppins-Regular',
        marginLeft: 10,
        marginRight: 10,
    },
    textVerified: {
        flex: 1,
        fontSize: 12,
        color: colors.GREEN.light,
        textAlign: 'right',
        fontFamily: 'Poppins-Regular',
        marginLeft: 10,
        marginRight: 10,
    },
    profileIcon: {
        resizeMode: 'center',
        width: 120,
        height: 120,
        marginTop: 10,
        // marginLeft: 10,
        borderRadius: 50 / 2,
    },
    icon: {
        width: 30,
        height: 30,
        marginLeft: 220,
        alignSelf: 'baseline',
        backgroundColor: '#ea4b6a',
        // textAlign: 'center',
        // textAlignVertical: 'center',
        borderRadius: 60 / 2,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon2: {
        // width: 30,
        // height: 30,
        // justifyContent:'center',
        // alignContent:'center',
        // alignItems: 'center',
        //backgroundColor: '#fff',
        // color: 'white',
        // textAlign: 'center',
        // textAlignVertical: 'center',
        // fontFamily: 'Poppins-Regular',
        // borderRadius: 60 / 2,
    },
});