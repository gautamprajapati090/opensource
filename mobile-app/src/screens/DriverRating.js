import React, { useState, useContext, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    Platform,
    Image,
    Modal,
    Dimensions
} from 'react-native';
import { Divider, Button, Header } from 'react-native-elements';
import StarRating from 'react-native-star-rating';
import { colors } from '../common/theme';
var { width } = Dimensions.get('window');
import i18n from 'i18n-js';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from 'common/src';
import moment from 'moment/min/moment-with-locales';
import { Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { hasNotch } from '../common/utility';

export default function DriverRating(props) {
    const { api } = useContext(FirebaseContext);
    const { updateBooking } = api;
    const dispatch = useDispatch();
    const { t } = i18n;
    const [starCount, setStarCount] = useState(0);
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const activeBookings = useSelector(state => state.bookinglistdata.active);
    const settings = useSelector(state => state.settingsdata.settings);
    const role = useSelector(state => state.auth.info.profile.usertype);
    const [booking, setBooking] = useState();
    const bookingId = props.navigation.getParam('bookingId');

    useEffect(() => {
        if (activeBookings && activeBookings.length >= 1) {
            let bookingData = activeBookings.filter(item => item.id == bookingId)[0];
            if (bookingData) {
                setBooking(bookingData);
            }
        }
    }, [activeBookings]);

    const onStarRatingPress = (rating) => {
        setStarCount(rating);
    }

    const skipRating = () => {
        let curBooking = { ...booking };
        curBooking.status = 'COMPLETE';
        dispatch(updateBooking(curBooking));
        props.navigation.navigate('Map');
    }


    const submitNow = () => {
        let curBooking = { ...booking };
        curBooking.rating = starCount;
        curBooking.status = 'COMPLETE';
        dispatch(updateBooking(curBooking));
        props.navigation.navigate('Map');
    }

    const alertModal = () => {
        return (
            <Modal
                animationType="none"
                transparent={true}
                visible={alertModalVisible}
                onRequestClose={() => {
                    setAlertModalVisible(false);
                }}>
                <View style={styles.alertModalContainer}>
                    <View style={styles.alertModalInnerContainer}>

                        <View style={styles.alertContainer}>

                            <Text style={styles.rideCancelText}>{t('no_driver_found_alert_title')}</Text>

                            <View style={styles.horizontalLLine} />

                            <View style={styles.msgContainer}>
                                <Text style={styles.cancelMsgText}>{t('thanks')}</Text>
                            </View>
                            <View style={styles.okButtonContainer}>
                                <Button
                                    title={t('no_driver_found_alert_OK_button')}
                                    titleStyle={styles.signInTextStyle}
                                    onPress={() => {
                                        setAlertModalVisible(false);
                                        props.navigation.navigate('Map')
                                    }}
                                    buttonStyle={styles.okButtonStyle}
                                    containerStyle={styles.okButtonContainerStyle}
                                />
                            </View>

                        </View>

                    </View>
                </View>

            </Modal>
        )
    }

    return (
        <View style={styles.mainViewStyle}>
            <Header
                backgroundColor={colors.GREY.default}
                leftComponent={{ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } }}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('receipt')}</Text>}
                rightComponent={<Text style={styles.headerskip} onPress={() => { skipRating() }}>{t('skip')}</Text>}
                containerStyle={[styles.headerStyle, { marginTop: role == 'driver' ? 0 : hasNotch ? 0 : -30 }]}
                innerContainerStyles={styles.headerInnerStyle}
            />
            <View style={styles.dateViewStyle}>
                <Text style={styles.dateViewTextStyle}>{booking && booking.tripdate ? moment(booking.tripdate).format('lll') : null}</Text>
            </View>

            <View style={styles.rateViewStyle}>
                <Text style={styles.rateViewTextStyle}>{settings.symbol}{booking ? booking.customer_paid > 0 ? parseFloat(booking.customer_paid).toFixed(2) : 0 : null}</Text>
            </View>

            <View style={styles.addressViewStyle}>

                <View style={styles.pickUpStyle}>
                    <MaterialCommunityIcons
                        name='map-marker'
                        size={24}
                        color='#ea4b6a'
                        style={styles.marker}
                    />
                    <Text style={{ ...styles.text, fontSize: 15 }}>{booking ? booking.pickup.add : ''}</Text>
                </View>

                <View style={styles.pickUpStyle}>
                    <MaterialCommunityIcons
                        name='map-marker'
                        size={24}
                        color='#00d362'
                        style={styles.marker}
                    />
                    <Text style={{ ...styles.text, fontSize: 15 }}>{booking ? booking.drop.add : ''}</Text>
                </View>

            </View>

            <View style={styles.tripMainView}>
                <View style={{ flex: 2.2, justifyContent: 'center', alignItems: "center" }}>
                    <View style={styles.tripSummaryStyle}>
                        <Divider style={[styles.divider, styles.summaryStyle]} />
                        <Text style={styles.summaryText}>{t('rate_ride')} </Text>
                        <Divider style={[styles.divider, styles.dividerStyle]} />
                    </View>
                    <View style={{ flex: 3, justifyContent: 'center', alignItems: "center" }}>
                        {booking ?

                            booking.driver_image != '' ? <Image source={{ uri: booking.driver_image }} style={{ height: 78, width: 78, borderRadius: 78 / 2 }} /> :

                                <Image source={require('../../assets/images/profilePic.png')} style={{ height: 78, width: 78, borderRadius: 78 / 2 }} />

                            : null}
                    </View>
                    <View style={styles.tripSummaryStyle}>
                        <Text style={styles.Drivername}>{booking ? booking.driver_name : null}</Text>

                    </View>
                </View>
                <View style={styles.ratingViewStyle}>
                    <StarRating
                        disabled={false}
                        maxStars={5}
                        starSize={30}
                        fullStar={'ios-star'}
                        halfStar={'ios-star-half'}
                        emptyStar={'ios-star-outline'}
                        iconSet={'Ionicons'}
                        fullStarColor={colors.YELLOW.primary}
                        emptyStarColor={colors.YELLOW.primary}
                        halfStarColor={colors.YELLOW.primary}
                        rating={starCount}
                        selectedStar={(rating) => onStarRatingPress(rating)}
                        buttonStyle={{ padding: 15 }}
                        containerStyle={styles.contStyle}
                    />
                </View>
            </View>

            <View style={styles.confBtnStyle}>
                <Button
                    title={t('submit_rating')}
                    titleStyle={{ fontFamily: 'Poppins-Regular', fontSize: 16 }}
                    onPress={() => submitNow()}
                    buttonStyle={styles.myButtonStyle}
                    disabled={starCount > 0 ? false : true}

                />
            </View>
            {
                alertModal()
            }
        </View>
    )

}
const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: colors.PINK.primary,
        borderBottomWidth: 0
    },
    headerInnerStyle: {
        marginLeft: 10,
        marginRight: 10
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Poppins-Bold',
        fontSize: 20
    },
    headerskip: {
        color: colors.WHITE,
        fontFamily: 'Poppins-Regular',
        fontSize: 16
    },
    dateViewStyle: {
        justifyContent: "center",
        flex: 1,
        marginTop: 20
    },
    dateViewTextStyle: {
        fontFamily: 'Poppins-Regular',
        color: colors.BLUE.primary,
        fontSize: 20,
        textAlign: "center"
    },
    rateViewStyle: {
        alignItems: 'center',
        flex: 2
    },
    rateViewTextStyle: {
        fontSize: 40,
        color: colors.BLUE.primary,
        fontFamily: 'Poppins-Bold',
        fontWeight: 'bold',
        textAlign: "center"
    },
    addressViewStyle: {
        flex: 4,
        paddingHorizontal: 15
    },
    addressViewTextStyle: {
        color: colors.GREY.secondary,
        fontSize: 19,
        fontFamily: 'Poppins-Regular',
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15,
        lineHeight: 24
    },
    greenDot: {
        backgroundColor: colors.GREEN.default,
        width: 12,
        height: 12,
        borderRadius: 50
    },
    redDot: {
        backgroundColor: colors.RED,
        width: 12,
        height: 12,
        borderRadius: 50
    },
    divider: {
        backgroundColor: colors.GREY.secondary,
        width: '15%',
        height: 1,
        top: '3%'
    },
    summaryText: {
        color: colors.BLUE.primary,
        fontSize: 16,
        textAlign: "center",
        fontFamily: 'Poppins-Regular',
        paddingLeft: 8,
        paddingRight: 5,
    },
    Drivername: {
        color: colors.BLUE.primary,
        fontSize: 20,
        textAlign: "center",
        fontFamily: 'Poppins-Regular',
    },
    mainViewStyle: {
        flex: 1,
        backgroundColor: colors.WHITE,
        flexDirection: 'column',
        //marginTop: StatusBar.currentHeight
    },
    pickUpStyle: {
        flexDirection: 'row', marginBottom: 5
    },
    tripMainView: {
        flex: 8,
        flexDirection: "column",
        justifyContent: "center",
    },
    ratingViewStyle: {
        flex: 1.8,
        flexDirection: "row",
        justifyContent: "center"
    },
    tripSummaryStyle: {
        flex: 1,
        flexDirection: "row",
        justifyContent: 'center',
    },
    confBtnStyle: {
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: '10%',
        alignItems: 'center'
    },
    myButtonStyle: {
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: colors.PINK.primary,
        width: 300,
        height: 45,
        padding: 10,
        borderColor: colors.TRANSPARENT,
        borderWidth: 0,
        borderRadius: 8
    },
    contStyle: {
        marginTop: 0,
        paddingBottom: Platform.OS == 'android' ? 5 : 0
    },
    summaryStyle: {
        justifyContent: "flex-end"
    },
    dividerStyle: {
        justifyContent: "flex-start"
    },
    //alert modal
    alertModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: colors.GREY.background },
    alertModalInnerContainer: { height: 200, width: (width * 0.85), backgroundColor: colors.WHITE, alignItems: 'center', alignSelf: 'center', borderRadius: 7 },
    alertContainer: { flex: 2, justifyContent: 'space-between', width: (width - 100) },
    rideCancelText: { flex: 1, top: 15, color: colors.BLACK, fontFamily: 'Poppins-Bold', fontSize: 20, alignSelf: 'center' },
    horizontalLLine: { width: (width - 110), height: 0.5, backgroundColor: colors.BLACK, alignSelf: 'center', },
    msgContainer: { flex: 2.5, alignItems: 'center', justifyContent: 'center' },
    cancelMsgText: { color: colors.BLACK, fontFamily: 'Poppins-Regular', fontSize: 15, alignSelf: 'center', textAlign: 'center' },
    okButtonContainer: { flex: 1, width: (width * 0.85), flexDirection: 'row', backgroundColor: colors.GREY.iconSecondary, alignSelf: 'center' },
    okButtonStyle: { flexDirection: 'row', backgroundColor: colors.GREY.iconSecondary, alignItems: 'center', justifyContent: 'center' },
    okButtonContainerStyle: { flex: 1, width: (width * 0.85), backgroundColor: colors.GREY.iconSecondary, },
    marker: {
        marginLeft: 0,
        marginTop: 0,
        alignSelf: 'center',
    },
    text: {
        fontSize: 16,
        color: colors.BLUE.primary,
        textAlign: 'left',
        fontFamily: 'Poppins-Regular',
        marginLeft: 10,
        marginRight: 5,
    },
});
