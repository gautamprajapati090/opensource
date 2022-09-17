import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    ImageBackground,
    ScrollView,
    Dimensions,
    Platform,
    Image,
    TouchableOpacity
} from 'react-native';
import { Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Header, Rating, Avatar, Button, Divider } from 'react-native-elements';
import Dash from 'react-native-dash';
import { colors } from '../common/theme';
import moment from 'moment/min/moment-with-locales';
var { width } = Dimensions.get('window');
import i18n from 'i18n-js';

import { useSelector } from 'react-redux';
import { hasNotch } from '../common/utility';

export default function RideDetails(props) {

    const paramData = props.navigation.getParam('data');
    const settings = useSelector(state => state.settingsdata.settings);
    const auth = useSelector(state => state.auth);
    const goBack = () => {
        props.navigation.goBack();
    }

    const goToBooking = (id) => {
        if (paramData.status == 'PAYMENT_PENDING') {
            props.navigation.navigate('PaymentDetails', { booking: paramData });
        } else {
            props.navigation.replace('BookedCab', { bookingId: id });
        }
    };

    const { t } = i18n;
    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.GREY.default}
                leftComponent={{ icon: 'ios-arrow-back', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { goBack() } }}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('ride_details_page_title')}</Text>}
                // containerStyle={styles.headerStyle}
                containerStyle={[styles.headerStyle, { marginTop: auth.info.profile.usertype == 'driver' ? 0 : hasNotch ? 0 : -30 }]}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <ScrollView>
                <View style={styles.mapView}>
                    <View style={styles.mapcontainer}>
                        {paramData ?
                            <MapView style={styles.map}
                                provider={PROVIDER_GOOGLE}
                                region={{
                                    latitude: (paramData.pickup.lat),
                                    longitude: (paramData.pickup.lng),
                                    latitudeDelta: 0.9922,
                                    longitudeDelta: 1.9421
                                }}
                            >
                                <Marker
                                    coordinate={{ latitude: paramData ? (paramData.pickup.lat) : 0.00, longitude: paramData ? (paramData.pickup.lng) : 0.00 }}
                                    title={'marker_title_1'}
                                    description={paramData ? paramData.pickup.add : null}
                                    pinColor={colors.GREEN.default}
                                />
                                <Marker
                                    coordinate={{ latitude: (paramData.drop.lat), longitude: (paramData.drop.lng) }}
                                    title={'marker_title_2'}
                                    description={paramData.drop.add}
                                />
                                {paramData.coords ?
                                    <MapView.Polyline
                                        coordinates={paramData.coords}
                                        strokeWidth={4}
                                        strokeColor={colors.BLUE.default}
                                        lineDashPattern={[1]}
                                    />
                                    : null}
                            </MapView>
                            : null}
                    </View>
                </View>

                <View style={styles.rideDesc}>

                    <Text style={{ ...styles.text, marginLeft: 10, marginVertical: 5 }}>Trip ID - #{paramData.id}</Text>

                    <View style={styles.mainCard}>
                        <View style={{ flexDirection: 'row' }}>

                            {paramData ?
                                paramData.driver_image != '' ?
                                    <Image
                                        source={{ uri: paramData.driver_image }}
                                        style={styles.icon}
                                    />
                                    : paramData.driver_name != '' ?
                                        <Image
                                            source={require('../../assets/images/profilePic.png')}
                                            style={styles.icon}
                                        /> : null
                                : null}

                            <View style={{ flexDirection: 'column', flex: 1, }}>


                                {paramData && paramData.driver_name != '' ? <View style={{ flexDirection: 'row', flex: 1, }}>
                                    <Text style={styles.text}>{paramData.driver_name}</Text>
                                </View> : null}

                                {paramData && paramData.rating > 0 ? <View style={{ flexDirection: 'row', flex: 1, }}>
                                    <Text style={styles.text2}>{t('you_rated_text')} - </Text>
                                    <Rating
                                        imageSize={15}
                                        readonly
                                        // startingValue={5}
                                        ratingCount={parseFloat(paramData.rating)}
                                        style={{ alignSelf: 'center' }}
                                    />
                                </View>
                                    : null}

                                {paramData && paramData.carType ?
                                    <View style={styles.roundContainer}>
                                        <Text style={styles.textCarNo}>{paramData.vehicle_number ? paramData.vehicle_number : t('car_no_not_found')} - </Text>
                                        <Text
                                            numberOfLines={1}
                                            style={styles.textCarName}>{paramData.carType}</Text>
                                    </View>
                                    : null}

                            </View>
                        </View>
                        <Divider style={{ backgroundColor: '#000', marginTop: 10, marginBottom: 10 }} />
                        <View style={{ flexDirection: 'row' }}>
                            <MaterialCommunityIcons
                                name='map-marker'
                                size={24}
                                color='#ea4b6a'
                                style={styles.marker}
                            />
                            <View style={{ flexDirection: 'column', flex: 1, }}>
                                {paramData && paramData.pickup &&
                                    <Text
                                        numberOfLines={2}
                                        style={{ ...styles.text, fontSize: 14 }}>{paramData.pickup.add}</Text>}
                                {paramData && paramData.trip_start_time &&
                                    <Text
                                        numberOfLines={1}
                                        style={styles.text2}>{moment(paramData.startTime).format('llll')}</Text>}
                                {/* moment(paramData.startTime).format('lll') */}
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 5 }}>
                            <MaterialCommunityIcons
                                name='map-marker'
                                size={24}
                                color='#00d362'
                                style={styles.marker}
                            />
                            <View style={{ flexDirection: 'column', flex: 1, }}>
                                {paramData && paramData.drop &&
                                    <Text
                                        numberOfLines={2}
                                        style={{ ...styles.text, fontSize: 14 }}>{paramData.drop.add}</Text>
                                }
                                {paramData && paramData.trip_end_time &&
                                    <Text
                                        numberOfLines={1}
                                        style={styles.text2}>{moment(paramData.endTime).format('llll')}</Text>}
                            </View>
                        </View>
                        <Divider style={{ backgroundColor: '#000', marginTop: 10, marginBottom: 2 }} />
                    </View>

                    {paramData && ['PENDING', 'PAID', 'COMPLETE'].indexOf(paramData.status) != -1 ?
                        <>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ ...styles.text, marginTop: 0 }}>Fare Details </Text>
                                {/* <Text style={{ ...styles.text2, marginLeft: 0, marginVertical: 4 }}>(Paid in cash)</Text> */}
                            </View>
                            <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 15 }}>
                                <Text numberOfLines={1} style={{ ...styles.text, flex: 5 }}>Ride Fare</Text>
                                <Text style={{ ...styles.text, flex: 0 }}>{settings.symbol} {paramData && paramData.trip_cost > 0 ? parseFloat(paramData.trip_cost).toFixed(2) : paramData && paramData.estimate ? parseFloat(paramData.estimate).toFixed(2) : 0}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 15 }}>
                                <View style={{ flex: 5 }}>
                                    <Text numberOfLines={1} style={{ ...styles.text }}>{t('discount')}</Text>
                                    <Text numberOfLines={1} style={{ ...styles.text, fontSize: 14, fontFamily: 'Poppins-Regular' }}>{t('promo_apply')}</Text>
                                </View>
                                <Text style={{ ...styles.text, flex: 0, color: colors.RED }}> - {settings.symbol}{paramData && paramData.discount_amount ? parseFloat(paramData.discount_amount).toFixed(2) : 0}</Text>
                            </View>
                            {paramData && paramData.cardPaymentAmount ? paramData.cardPaymentAmount > 0 ?
                                <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 15 }}>
                                    <Text numberOfLines={1} style={{ ...styles.text, flex: 5 }}>{t('CardPaymentAmount')}</Text>
                                    <Text style={{ ...styles.text, flex: 0 }}>  {settings.symbol}{paramData && paramData.cardPaymentAmount ? parseFloat(paramData.cardPaymentAmount).toFixed(2) : 0}</Text>

                                </View>
                                : null : null}
                            {paramData && paramData.cashPaymentAmount ? paramData.cashPaymentAmount > 0 ?
                                <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 15 }}>
                                    <Text numberOfLines={1} style={{ ...styles.text, flex: 5 }}>{t('CashPaymentAmount')}</Text>
                                    <Text style={{ ...styles.text, flex: 0 }}>  {settings.symbol}{paramData && paramData.cashPaymentAmount ? parseFloat(paramData.cashPaymentAmount).toFixed(2) : 0}</Text>
                                </View>
                                : null : null}
                            {paramData && paramData.usedWalletMoney ? paramData.usedWalletMoney > 0 ?
                                <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 15 }}>
                                    <Text numberOfLines={1} style={{ ...styles.text, flex: 5 }}>{t('WalletPayment')}</Text>
                                    <Text style={{ ...styles.text, flex: 0 }}>  {settings.symbol}{paramData && paramData.usedWalletMoney ? parseFloat(paramData.usedWalletMoney).toFixed(2) : 0}</Text>
                                </View>
                                : null : null}

                            <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 15 }}>
                                <Text numberOfLines={1} style={{ ...styles.text, flex: 5, fontFamily: 'Poppins-Bold' }}>{t('Customer_paid')}</Text>
                                <Text style={{ ...styles.text, flex: 0, fontFamily: 'Poppins-Bold' }}>{settings.symbol}{paramData && paramData.customer_paid ? parseFloat(paramData.customer_paid).toFixed(2) : null}</Text>
                            </View>
                        </>
                        : null}

                </View>

                {paramData && ['PENDING', 'PAID', 'COMPLETE'].indexOf(paramData.status) != -1 ?
                    <View style={{paddingBottom:10}}>
                        <View style={styles.iosView}>
                            {
                                Platform.OS == 'ios' ?
                                    <ImageBackground source={require('../../assets/images/dash.png')}
                                        style={styles.backgroundImage}
                                        resizeMode={Platform.OS == 'ios' ? 'repeat' : 'stretch'}>
                                    </ImageBackground>
                                    :
                                    <Dash style={styles.dashView} />
                            }
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ ...styles.text, marginTop: 0 }}>{t('payment_status')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 15 }}>
                            <Text numberOfLines={1} style={{ ...styles.text, flex: 5 }}>{t('payment_status')}</Text>
                            <Text style={{ ...styles.text, flex: 0 }}>{t(paramData.status)}</Text>
                        </View>
                        {['PAID', 'COMPLETE'].indexOf(paramData.status) != -1 ?
                            <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 15 }}>
                                <Text numberOfLines={1} style={{ ...styles.text, flex: 5 }}>{t('pay_mode')}</Text>
                                <Text style={{ ...styles.text, flex: 0 }}>{paramData.payment_mode ? paramData.payment_mode : null} {paramData.gateway ? '(' + paramData.gateway + ')' : null}</Text>
                            </View>
                            : null}
                    </View>
                    : null}

                {(paramData && paramData.status && auth && auth.info && auth.info.profile &&
                    (((['PAYMENT_PENDING', 'NEW', 'ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED', 'PENDING', 'PAID'].indexOf(paramData.status) != -1) && auth.info.profile.usertype == 'rider') ||
                        ((['ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED'].indexOf(paramData.status) != -1) && auth.info.profile.usertype == 'driver'))) ?
                    <View style={styles.locationView2}>
                        <Button
                            title={t('go_to_booking')}
                            loading={false}
                            loadingProps={{ size: "large", color: colors.GREEN.default }}
                            titleStyle={styles.buttonTitleText2}
                            onPress={() => { goToBooking(paramData.id) }}
                            containerStyle={styles.paynowButton}
                            buttonStyle={styles.registerButton}
                        />
                    </View> : null}
            </ScrollView>
        </View>
    )

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
    mapView: {
        justifyContent: 'center',
        alignItems: 'center',
        height: Dimensions.get('window').height / 3.5,
        marginBottom: 15
    },
    mapcontainer: {
        flex: 7,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height / 3.5,
        ...StyleSheet.absoluteFillObject,
    },
    rideDesc: {
        flexDirection: 'column'
    },
    locationView2: {
        flex: 1,
        flexDirection: 'row',
        // paddingHorizontal: 10,
        padding: 10,
        marginVertical: 14,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: 2,
    },
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight 
    },
    ratingText: {
        fontSize: 16,
        color: colors.GREY.iconSecondary,
        marginRight: 8,
        fontFamily: 'Poppins-Regular'
    },
    iosView: {
        paddingVertical: 10,
        paddingHorizontal: 10
    },
    dashView: {
        width: width * .95, height: 1
    },
    paynowButton: {
        flex: 1,
        width: '80%',
        height: 150,
        paddingLeft: 10
    },
    registerButton: {
        backgroundColor: colors.YELLOW.primary,
        // width: 180,
        // height: 45,
        borderColor: colors.TRANSPARENT,
        borderWidth: 0,
        // marginTop: 30,
        borderRadius: 8,
        elevation: 0
    },


    icon: {
        width: 75,
        height: 75,
        marginLeft: 0,
        marginTop: 0,
        // alignSelf: 'center',
        backgroundColor: '#01184e',
        borderRadius: 5,
    },
    marker: {
        marginLeft: 0,
        marginTop: 0,
        alignSelf: 'center',
    },
    mainCard: {
        flexDirection: 'column',
        // margin: 10,
        marginLeft: 10,
        marginRight: 10,
        // marginTop: 5,
        marginBottom: 5,
        paddingTop: 10,
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 16,
        color: '#01184e',
        textAlign: 'left',
        fontFamily: 'Poppins-Medium',
        marginLeft: 15,
        marginRight: 0,
    },
    text2: {
        fontSize: 12,
        color: '#01184e',
        textAlign: 'left',
        fontFamily: 'Poppins-Regular',
        marginLeft: 15,
        marginRight: 0,
    },
    textCarNo: {
        fontSize: 14,
        color: '#01184e',
        marginLeft: 2,
        fontFamily: 'Poppins-Medium',
        textAlign: 'left',
        textAlignVertical: 'center',
    },
    textCarName: {
        flex: 1,
        fontSize: 14,
        color: '#01184e',
        textAlign: 'left',
        fontFamily: 'Poppins-Regular',
    },
    roundContainer: {
        flexDirection: 'row',
        // justifyContent: 'center',
        // alignItems: 'center',
        alignSelf: 'flex-start',
        marginLeft: 15,
        marginRight: 0,
        marginTop: 5,
        padding: 2,
        paddingHorizontal: 5,
        borderColor: '#ea4b6a',
        borderWidth: 1,
        borderRadius: 5,
    },
});