import React, { useRef } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    TouchableOpacity,
    Text,
    Platform,
    Modal
} from 'react-native';
import { Icon, Button, Header } from 'react-native-elements';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { colors } from '../common/theme';
var { width, height } = Dimensions.get('window');
import i18n from 'i18n-js';
import { Ionicons, Entypo, FontAwesome } from '@expo/vector-icons';

export default function taxiModal(props) {
    const { t } = i18n;
    const { settings, tripdata, estimate, bookingModalStatus, onPressCancel, bookNow } = props;

    const mapRef = useRef(null);

    const runFitCoords = () => {
        setTimeout(() => {
            mapRef.current.fitToCoordinates([{ latitude: tripdata.pickup.lat, longitude: tripdata.pickup.lng }, { latitude: tripdata.drop.lat, longitude: tripdata.drop.lng }], {
                edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                animated: true,
            });
        }, 1000);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={bookingModalStatus}
            onShow={runFitCoords}
        >
            <View style={styles.container}>
                <Header
                    backgroundColor={colors.GREY.default}
                    centerComponent={<Text style={styles.headerTitleStyle}>{t('confirm_booking')}</Text>}
                    containerStyle={styles.headerStyle}
                    innerContainerStyles={styles.headerInnerStyle}
                />

                {/* <View style={styles.topContainer}>
                    <View style={styles.topLeftContainer}>
                        <View style={styles.circle} />
                        <View style={styles.staightLine} />
                        <View style={styles.square} />
                    </View>
                    {tripdata && tripdata.pickup && tripdata.drop ?
                        <View style={styles.topRightContainer}>
                            <TouchableOpacity style={styles.whereButton}>
                                <View style={styles.whereContainer}>
                                    <Text numberOfLines={1} style={styles.whereText}>{tripdata.pickup.add}</Text>
                                    <Icon
                                        name='gps-fixed'
                                        color={colors.WHITE}
                                        size={23}
                                        containerStyle={styles.iconContainer}
                                    />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.dropButton}>
                                <View style={styles.whereContainer}>
                                    <Text numberOfLines={1} style={styles.whereText}>{tripdata.drop.add}</Text>
                                    <Icon
                                        name='search'
                                        type='feather'
                                        color={colors.WHITE}
                                        size={23}
                                        containerStyle={styles.iconContainer}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                        : null}
                </View> */}

                <View style={styles.addressBar}>
                    <View style={styles.ballandsquare}>
                        {/* <View style={styles.hbox1} /><View style={styles.hbox2} /><View style={styles.hbox3} /> */}
                        <Text style={{ ...styles.text2, color: '#ea4b6a', flex: 0 }}>Pickup</Text>
                        <Entypo name='dots-three-vertical' size={10} color='#000' style={{ ...styles.dotIcon, marginTop: 3 }} />
                        <Entypo name='dots-three-vertical' size={10} color='#000' style={{ ...styles.dotIcon, marginBottom: 5 }} />
                        <Text style={{ ...styles.text2, color: '#00d362', flex: 0 }}>Drop</Text>
                    </View>
                    <View style={styles.contentStyle}>
                        <TouchableOpacity onPress={() => tapAddress('pickup')} style={styles.addressStyle1}>
                            <Text numberOfLines={1} style={[styles.textStyle, { fontSize: 14 }]}>{tripdata && tripdata.pickup && tripdata.pickup.add ? tripdata.pickup.add : t('map_screen_where_input_text')}</Text>
                        </TouchableOpacity>
                        <View style={{ height: 1, marginRight: 0, backgroundColor: colors.GREY.btnPrimary }} />
                        <TouchableOpacity onPress={() => tapAddress('drop')} style={styles.addressStyle2}>
                            <Text numberOfLines={1} style={[styles.textStyle, { fontSize: 14 }]}>{tripdata && tripdata.drop && tripdata.drop.add ? tripdata.drop.add : t('map_screen_drop_input_text')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.mapcontainer}>
                    {tripdata && tripdata.pickup && tripdata.drop ?
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={{
                                latitude: (tripdata.pickup.lat),
                                longitude: (tripdata.pickup.lng),
                                latitudeDelta: 0.9922,
                                longitudeDelta: 1.9421
                            }}
                        >
                            <Marker
                                coordinate={{ latitude: (tripdata.pickup.lat), longitude: (tripdata.pickup.lng) }}
                                title={tripdata.pickup.add}
                                pinColor={colors.GREEN.default}
                            >
                            </Marker>


                            <Marker
                                coordinate={{ latitude: (tripdata.drop.lat), longitude: (tripdata.drop.lng) }}
                                title={tripdata.drop.add}
                            >
                            </Marker>

                            {estimate && estimate.waypoints ?
                                <MapView.Polyline
                                    coordinates={estimate.waypoints}
                                    strokeWidth={5}
                                    strokeColor={colors.BLUE.primary}
                                    lineDashPattern={[1]}
                                />
                                : null}

                        </MapView>
                        : null}
                </View>
                <View style={styles.bottomContainer}>
                    <View style={styles.offerContainer}>
                        <TouchableOpacity >
                            <Text style={styles.offerText}> {t('estimate_fare_text')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.priceDetailsContainer}>
                        <View style={styles.priceDetailsLeft}>
                            <View style={styles.priceDetails}>
                                <View style={styles.totalFareContainer}>
                                    <Text style={styles.totalFareText}>{t('total_fare')}</Text>
                                </View>
                                <Icon
                                    name='info'
                                    color={colors.WHITE}
                                    type='simple-line-icon'
                                    size={15}
                                    containerStyle={styles.infoIcon}
                                />
                            </View>

                            <View style={styles.iconContainer}>
                                <Text style={styles.priceText}> {settings ? settings.symbol : null} {estimate ? estimate.estimateFare : null}</Text>
                            </View>

                        </View>
                        <View style={styles.priceDetailsMiddle}>
                            <View style={styles.triangle} />
                            <View style={styles.lineHorizontal} />
                        </View>
                        <View style={styles.priceDetailsLeft}>
                            <View style={styles.priceDetails}>
                                <View style={styles.totalFareContainer}>
                                    <Text style={styles.totalFareText}>{estimate && estimate.estimateDistance ? parseFloat(estimate.estimateDistance).toFixed(2) : 0} {settings && settings.convert_to_mile ? t('mile') : t('km')} </Text>
                                </View>
                                <Icon
                                    name='info'
                                    color={colors.WHITE}
                                    type='simple-line-icon'
                                    size={15}
                                    containerStyle={styles.infoIcon}
                                />
                            </View>
                            <View style={styles.iconContainer}>
                                <Text style={styles.priceText}>{estimate ? parseFloat(estimate.estimateTime / 60).toFixed(0) : 0} {t('mins')}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 1.5, flexDirection: 'row' }}>
                        <View style={styles.iconContainer}>
                            <Button
                                title={t('cancel')}
                                loading={false}
                                loadingProps={{ size: "large", color: colors.WHITE }}
                                titleStyle={{ color: colors.WHITE, fontFamily: 'Poppins-Medium' }}
                                onPress={onPressCancel}
                                buttonStyle={{ height: '100%', backgroundColor: colors.BLUE.primary }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        <View style={styles.flexView}>
                            <Button
                                title={t('confirm')}
                                loadingProps={{ size: "large", color: colors.BLUE.default }}
                                titleStyle={{ color: colors.WHITE, fontFamily: 'Poppins-Medium' }}
                                onPress={bookNow}
                                buttonStyle={{ height: '100%', backgroundColor: colors.GREY.btnPrimary }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );

}

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: colors.PINK.default,
        borderBottomWidth: 0,
        marginTop: -35,
        paddingTop: 35
    },
    headerInnerStyle: {
        marginLeft: 10,
        marginRight: 10
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Poppins-Bold',
        fontSize: 18
    },
    container: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight
    },
    topContainer: {
        flex: 1.5,
        flexDirection: 'row',
        borderTopWidth: 0,
        alignItems: 'center',
        backgroundColor: colors.GREY.default,
        paddingEnd: 20
    },
    topLeftContainer: {
        flex: 1.5,
        alignItems: 'center'
    },
    topRightContainer: {
        flex: 9.5,
        justifyContent: 'space-between',
    },
    circle: {
        height: 12,
        width: 12,
        borderRadius: 15 / 2,
        backgroundColor: colors.YELLOW.light
    },
    staightLine: {
        height: height / 25,
        width: 1,
        backgroundColor: colors.YELLOW.light
    },
    square: {
        height: 14,
        width: 14,
        backgroundColor: colors.GREY.iconPrimary
    },
    whereButton: { flex: 1, justifyContent: 'center', borderBottomColor: colors.WHITE, borderBottomWidth: 1 },
    whereContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    whereText: { flex: 9, fontFamily: 'Poppins-Regular', fontSize: 14, fontWeight: '400', color: colors.WHITE },
    iconContainer: { flex: 1 },
    dropButton: { flex: 1, justifyContent: 'center' },
    mapcontainer: {
        flex: 7,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
    bottomContainer: { flex: 2.5, alignItems: 'center' },
    offerContainer: { flex: 1, backgroundColor: colors.YELLOW.secondary, width: width, justifyContent: 'center', borderBottomColor: colors.YELLOW.primary, borderBottomWidth: Platform.OS == 'ios' ? 1 : 0 },
    offerText: { alignSelf: 'center', color: colors.WHITE, fontSize: 12, fontFamily: 'Poppins-Regular' },
    priceDetailsContainer: { flex: 2.3, backgroundColor: colors.WHITE, flexDirection: 'row', position: 'relative', zIndex: 1 },
    priceDetailsLeft: { flex: 19 },
    priceDetailsMiddle: { flex: 2, height: 50, width: 1, alignItems: 'center' },
    priceDetails: { flex: 1, flexDirection: 'row' },
    totalFareContainer: { flex: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    totalFareText: { color: colors.GREY.btnPrimary, fontFamily: 'Poppins-Bold', fontSize: 15, marginLeft: 40 },
    infoIcon: { flex: 2, alignItems: 'center', justifyContent: 'center' },
    priceText: { alignSelf: 'center', color: colors.GREY.iconSecondary, fontFamily: 'Poppins-Bold', fontSize: 20 },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: colors.TRANSPARENT,
        borderStyle: 'solid',
        borderLeftWidth: 9,
        borderRightWidth: 9,
        borderBottomWidth: 10,
        borderLeftColor: colors.TRANSPARENT,
        borderRightColor: colors.TRANSPARENT,
        borderBottomColor: colors.YELLOW.secondary,
        transform: [
            { rotate: '180deg' }
        ],
        marginTop: -1, overflow: 'visible'
    },
    lineHorizontal: { height: height / 18, width: 1, backgroundColor: colors.BLACK, alignItems: 'center', marginTop: 10 },
    logoContainer: { flex: 19, alignItems: 'center', justifyContent: 'center' },
    logoImage: { width: 80, height: 80 },
    buttonsContainer: { flex: 1.5, flexDirection: 'row' },
    buttonText: { color: colors.WHITE, fontFamily: 'Poppins-Bold', fontSize: 17, alignSelf: 'flex-end' },
    buttonStyle: { backgroundColor: colors.GREY.secondary, elevation: 0 },
    buttonContainerStyle: { flex: 1, backgroundColor: colors.GREY.secondary },
    confirmButtonStyle: { backgroundColor: colors.GREY.btnPrimary, elevation: 0 },
    confirmButtonContainerStyle: { flex: 1, backgroundColor: colors.GREY.btnPrimary },

    flexView: {
        flex: 1
    },

    addressBar: {
        // position: 'absolute',
        // marginHorizontal: 20,
        alignSelf: 'center',
        // top: hasNotch ? 100 : 80,
        // top: 70,
        height: 100,
        width: width - 0,
        flexDirection: 'row',
        backgroundColor: colors.WHITE,
        paddingLeft: 10,
        paddingRight: 10,
        // shadowColor: 'black',
        // shadowOffset: { width: 2, height: 2 },
        // shadowOpacity: 0.5,
        // shadowRadius: 5,
        // borderRadius: 8,
        // elevation: 3
    },
    ballandsquare: {
        // width: 12,
        flexDirection: 'column', flex: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    contentStyle: {
        justifyContent: 'center',
        width: width - 60,
        height: 100,
        paddingLeft: 10
    },
    addressStyle1: {
        // borderBottomColor: colors.GREY.btnPrimary,
        // borderBottomWidth: 1,
        height: 48,
        // width: width - 70,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 2
    },
    addressStyle2: {
        height: 48,
        // width: width - 70,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    textStyle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#000'
    },
    text1: {
        fontFamily: 'Poppins-Bold',
        fontSize: 14,
        fontWeight: '900',
        color: colors.BLACK
    },
    text2: {
        fontFamily: 'Poppins-Regular',
        fontSize: 11,
        fontWeight: '900',
        color: colors.BLACK
    },
});
