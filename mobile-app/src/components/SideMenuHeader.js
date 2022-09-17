import React from 'react';
import { Text, View, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Icon } from 'react-native-elements'
import { colors } from '../common/theme';
//make a compontent
const SideMenuHeader = ({ headerStyle, approved, userType, userPhoto, userName, userEmail, userPhone }) => {
    return (
        <View style={[styles.viewStyle, headerStyle]}>
            {/* <TouchableOpacity style={styles.userImageView} > */}
            <View>
                <Image
                    source={userPhoto == null ? require('../../assets/images/profilePic.png') : { uri: userPhoto }}
                    // source={{ uri: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80' }}
                    style={styles.imageStyle}
                />
                {userType == "driver" && approved &&
                    <View style={styles.iconProfile}>
                        <Image style={styles.icon2Profile} source={require('../../assets/images/ic_verify.png')} />
                    </View>
                }
            </View>
            <View style={{ flexDirection: 'column', flex: 1 }}>
                <Text numberOfLines={2} style={styles.ProfileNameStyle}>{userName ? userName : ""}</Text>
                <View style={styles.iconViewStyle}>
                    <Icon
                        name='device-mobile'
                        type='octicon'
                        color={colors.WHITE}
                        size={16}
                    />
                    <Text style={styles.emailStyle}>{userPhone ? userPhone : ""}</Text>
                </View>
            </View>
        </View>
    );

};

const styles = {
    viewStyle: {
        backgroundColor: colors.PINK.primary,
        justifyContent: 'center',
        alignItems: 'center',
        height: 150,
        // paddingTop: Platform.OS == 'ios' ? 20 : StatusBar.currentHeight-20,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        elevation: 2,
        position: 'relative',
        flexDirection: 'row',
        paddingHorizontal: 15
    },
    textStyle: {
        fontSize: 20,
        color: colors.WHITE
    },
    headerTextStyle: {
        // justifyContent: 'center',
        // alignItems: 'center',
        // marginTop: 10,
        marginLeft: 15,
    },
    iconStyle: {

    },
    userImageView: {
        width: 80,
        height: 80,
        borderRadius: 20 / 2,
        overflow: 'hidden',
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    ProfileNameStyle: {
        fontFamily: 'Poppins-Bold',
        color: colors.WHITE,
        fontSize: 17,
        marginLeft: 15,
        textTransform: 'capitalize'
    },
    iconViewStyle: {
        width: 220,
        // justifyContent: 'center',
        // alignItems: 'center',
        flexDirection: 'row',
        marginTop: 5,
        marginLeft: 15,

    },
    emailStyle: {
        fontFamily: 'Poppins-Medium',
        color: colors.WHITE,
        fontSize: 15,
        marginLeft: 4,
        textAlign: 'center',
    },
    imageStyle: {
        width: 80,
        height: 80,
        borderRadius: 20 / 2,
        backgroundColor: colors.WHITE,
    },
    iconProfile: {
        width: 20,
        height: 20,
        marginLeft: 70,
        marginTop: -5,
        alignSelf: 'baseline',
        backgroundColor: '#ea4b6a',
        borderRadius: 60 / 2,
        position: 'absolute',
    },
    icon2Profile: {
        width: 20,
        height: 20,
        alignSelf: 'center',
    },
}
//make the component available to other parts of the app
export default SideMenuHeader;