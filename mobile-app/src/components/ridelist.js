import React, { useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Divider, Icon, Rating } from 'react-native-elements'
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import moment from 'moment/min/moment-with-locales';
import { FirebaseContext } from 'common/src';
import { Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';

export default function RideList(props) {
    const { t } = i18n;
    const { appcat } = useContext(FirebaseContext);

    const settings = useSelector(state => state.settingsdata.settings);
    const [tabIndex, setTabIndex] = useState(props.tabIndex);

    const onPressButton = (item, index) => {
        props.onPressButton(item, index)
    }


    const renderData = ({ item, index }) => {
        return (
            <>
                {/* <TouchableOpacity style={styles.iconClickStyle} onPress={() => onPressButton(item, index)}>
                    <View style={styles.iconViewStyle}>
                        {appcat == 'delivery' ?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.DARK}
                                size={35}
                            />
                            :
                            <Icon
                                name='car-sports'
                                type='material-community'
                                color={colors.DARK}
                                size={35}
                            />
                        }
                    </View>
                    <View style={styles.flexViewStyle}>
                        <View style={styles.textView1}>

                            <Text style={[styles.textStyle, styles.dateStyle]}>{item.bookingDate ? moment(item.bookingDate).format('lll') : ''}</Text>
                            <Text style={[styles.textStyle, styles.carNoStyle]}>{item.carType ? item.carType : null} - {item.vehicle_number ? item.vehicle_number : t('no_car_assign_text')}</Text>
                            <View style={[styles.picupStyle, styles.position]}>

                                <View style={styles.greenDot} />
                                <Text style={[styles.picPlaceStyle, styles.placeStyle]}>{item.pickup ? item.pickup.add : t('not_found_text')}</Text>
                            </View>
                            <View style={[styles.dropStyle, styles.textViewStyle]}>
                                <View style={[styles.redDot, styles.textPosition]} />
                                <Text style={[styles.dropPlaceStyle, styles.placeStyle]}>{item.drop ? item.drop.add : t('not_found_text')}</Text>
                            </View>

                        </View>
                        <View style={styles.textView2}>
                            <Text style={[styles.fareStyle, styles.dateStyle]}>{item.status == 'NEW' || item.status == 'PAYMENT_PENDING' ? t(item.status) : null}</Text>
                            <Text style={[styles.fareStyle, styles.dateStyle]}>{item.status == 'PAID' || item.status == 'COMPLETE' ? item.customer_paid ? settings.symbol + parseFloat(item.customer_paid).toFixed(2) : settings.symbol + parseFloat(item.estimate).toFixed(2) : null}</Text>
                            {
                                item.status == 'CANCELLED' ?
                                    <Image
                                        style={styles.cancelImageStyle}
                                        source={require('../../assets/images/cancel.png')}
                                    />
                                    :
                                    null
                            }
                        </View>
                    </View>
                </TouchableOpacity> */}


                <TouchableOpacity style={styles.mainCard} onPress={() => onPressButton(item, index)}>
                    <View style={{ flexDirection: 'row' }}>
                        {/* <Image
                            // source={{ uri: this.proileImage }}
                            style={styles.icon}
                        /> */}
                        {appcat == 'delivery' ?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.DARK}
                                size={60}
                            />
                            :
                            <Icon
                                name='car-sports'
                                type='material-community'
                                color={colors.DARK}
                                size={60}
                            />
                        }
                        <View style={{ flexDirection: 'column', flex: 1, }}>
                            <View style={{ flexDirection: 'row', flex: 1, }}>
                                <Text style={{ ...styles.text, flex: 5 }}>{item.driver_name ? item.driver_name : 'NA'}</Text>
                                {/* <Text style={{ ...styles.text, flex: 0 }}>₹150</Text> */}
                                <Text style={[styles.text]}>{item.status == 'NEW' || item.status == 'PAYMENT_PENDING' ? t(item.status) : null}</Text>
                                <Text style={[styles.text]}>{item.status == 'PAID' || item.status == 'COMPLETE' ? item.customer_paid ? settings.symbol + parseFloat(item.customer_paid).toFixed(2) : settings.symbol + parseFloat(item.estimate).toFixed(2) : null}</Text>
                                {
                                    item.status == 'CANCELLED' ?
                                        <Image
                                            style={styles.cancelImageStyle}
                                            source={require('../../assets/images/cancel.png')}
                                        />
                                        :
                                        null
                                }
                            </View>
                            <View style={{ flexDirection: 'row', flex: 1}}>
                                <Text style={styles.text2}>You Rated - </Text>
                                <Rating
                                    imageSize={15}
                                    readonly
                                    startingValue={item.driverRating}
                                    // style={{ alignSelf: 'center' }}
                                />
                            </View>
                            <View style={styles.roundContainer}>
                                <Text style={styles.textCarNo}>{item.vehicle_number ? item.vehicle_number : t('no_car_assign_text')} - </Text>
                                <Text
                                    numberOfLines={1}
                                    style={styles.textCarName}>{item.carType}</Text>
                            </View>
                        </View>
                    </View>
                    <Divider style={{ backgroundColor: '#000', marginTop: 10, marginBottom: 2 }} />
                    <View style={{ flexDirection: 'row' }}>
                        <MaterialCommunityIcons
                            name='map-marker'
                            size={24}
                            color='#ea4b6a'
                            style={styles.marker}
                        />
                        <View style={{ flexDirection: 'column', flex: 1, }}>
                            <Text
                                numberOfLines={2}
                                style={{ ...styles.text, fontSize: 14 }}>{item.pickup ? item.pickup.add : t('not_found_text')}</Text>
                            <Text
                                numberOfLines={1}
                                style={styles.text2}>{item.startTime ? moment(item.startTime).format('llll') : ''}</Text>
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
                            <Text
                                numberOfLines={2}
                                style={{ ...styles.text, fontSize: 14 }}>{item.drop ? item.drop.add : t('not_found_text')}</Text>
                            <Text
                                numberOfLines={1}
                                style={styles.text2}>{item.endTime ? moment(item.endTime).format('llll') : ''}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </>
        )
    }


    return (
        <View style={styles.textView3}>
            <SegmentedControlTab
                values={[t('active_booking'), t('COMPLETE'), t('CANCELLED')]}
                selectedIndex={tabIndex}
                onTabPress={(index) => setTabIndex(index)}
                borderRadius={0}
                tabsContainerStyle={styles.segmentcontrol}
                tabStyle={{
                    borderWidth: 0,
                    backgroundColor: 'transparent',
                    // backgroundColor: colors.BLUE.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.GREY.primary,

                }}
                activeTabStyle={{ borderBottomColor: colors.GREY.background, backgroundColor: 'transparent', borderBottomWidth: 2 }}
                tabTextStyle={{ color: colors.GREY.secondary, fontFamily:'Poppins-Medium' }}
                activeTabTextStyle={{ color: colors.GREY.background }}
            />
            <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={tabIndex === 0 ? props.data.filter(item => !(item.status === 'CANCELLED' || item.status === 'COMPLETE')) : (tabIndex === 1 ? props.data.filter(item => item.status === 'COMPLETE') : props.data.filter(item => item.status === 'CANCELLED'))}
                renderItem={renderData}
            />
        </View>
    );

};

const styles = StyleSheet.create({
    textStyle: {
        fontSize: 18,
    },
    fareStyle: {
        fontSize: 18,
    },
    carNoStyle: {
        marginLeft: 45,
        fontSize: 13,
        marginTop: 10
    },
    picupStyle: {
        flexDirection: 'row',
    },
    picPlaceStyle: {
        color: colors.GREY.secondary
    },
    dropStyle: {
        flexDirection: 'row',
    },
    drpIconStyle: {
        color: colors.RED,
        fontSize: 20
    },
    dropPlaceStyle: {
        color: colors.GREY.secondary
    },
    greenDot: {
        alignSelf: 'center',
        borderRadius: 10,
        width: 10,
        height: 10,
        backgroundColor: colors.GREEN.default
    },
    redDot: {
        borderRadius: 10,
        width: 10,
        height: 10,
        backgroundColor: colors.RED

    },
    logoStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconClickStyle: {
        flex: 1,
        flexDirection: 'row'
    },
    flexViewStyle: {
        flex: 7,
        flexDirection: 'row',
        borderBottomColor: colors.GREY.secondary,
        borderBottomWidth: 1,
        marginTop: 10,
        marginLeft: 5
    },
    dateStyle: {
        fontFamily: 'Poppins-Bold',
        color: colors.GREY.default
    },
    carNoStyle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        marginTop: 8,
        color: colors.GREY.default
    },
    placeStyle: {
        marginLeft: 10,
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        alignSelf: 'center'
    },
    textViewStyle: {
        marginTop: 10,
        marginBottom: 10
    },
    cancelImageStyle: {
        width: 50,
        height: 50,
        marginRight: 0,
        // marginTop: 18,
        // alignSelf: 'flex-end',
        position: 'absolute',
        right: 0,
        top: -3

    },
    iconViewStyle: {
        flex: 1, marginTop: 10
    },
    textView1: {
        flex: 5
    },
    textView2: {
        flex: 2
    },
    textView3: {
        flex: 1
    },
    position: {
        marginTop: 20
    },
    textPosition: {
        alignSelf: 'center'
    },
    segmentcontrol: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily: "Poppins-Regular",
        marginTop: 0,
        alignSelf: "center",
        height: 50
    },



    icon: {
        width: 75,
        height: 75,
        marginLeft: 0,
        marginTop: 0,
        // alignSelf: 'center',
        backgroundColor: '#01184e',
        // color: 'white',
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
        marginTop: 5,
        marginBottom: 5,
        padding: 10,
        backgroundColor: '#fff',
        borderColor: '#969696',
        borderWidth: 1,
        borderRadius: 20 / 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.32,
        shadowRadius: 5.46,
        elevation: 3,
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