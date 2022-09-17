import React from 'react';
import { Header } from 'react-native-elements';
import { colors } from '../common/theme';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    Dimensions,
    Image,
    ScrollView
} from 'react-native';
var { width } = Dimensions.get('window');

import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import { hasNotch } from '../common/utility';

export default function AboutPage(props) {

    const auth = useSelector(state => state.auth);
    const { t } = i18n;

    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.GREY.default}
                leftComponent={{ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } }}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('about_us_menu')}</Text>}
                containerStyle={[styles.headerStyle, { marginTop: auth.info.profile.usertype == 'driver' ? 0 : hasNotch ? 0 : -30 }]}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                    <View styles={{ flex: 1 }}>
                        <View style={{ height: 200, width: 200, marginTop: 30, marginBottom: 40, alignSelf: 'center' }}>
                            <Image
                                style={{ width: 200, height: 200, borderRadius: 15 }}
                                source={require('../../assets/images/logo1024x1024.png')}
                            />
                        </View>
                        <View style={{ width: width, paddingHorizontal: 10 }}>
                            <Text style={{ textAlign: 'justify', fontSize: 16, lineHeight: 28, fontFamily: 'Poppins-Regular', color: colors.BLUE.primary }}>
                                {t('about_us_content1') + ' ' + t('about_us_content2')}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight,
    },
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
    aboutTitleStyle: {
        color: colors.BLACK,
        fontFamily: 'Poppins-Bold',
        fontSize: 20,
        marginLeft: 8,
        marginTop: 8
    },
    aboutcontentmainStyle: {
        marginTop: 12,
        marginBottom: 60
    },
    aboutcontentStyle: {
        color: colors.GREY.secondary,
        fontFamily: 'Poppins-Regular',
        fontSize: 15,
        textAlign: "justify",
        alignSelf: 'center',
        width: width - 20,
        letterSpacing: 1,
        marginTop: 6,
    },
    contact: {
        marginTop: 6,
        marginLeft: 8,
        //flexDirection:'row',
        width: "100%",
        marginBottom: 30
    },
    contacttype1: {
        textAlign: 'left',
        color: colors.GREY.secondary,
        fontFamily: 'Poppins-Bold',
        fontSize: 15,
    },
    contacttype2: {
        textAlign: 'left',
        marginTop: 4,
        color: colors.GREY.secondary,
        fontFamily: 'Poppins-Bold',
        fontSize: 15,
    }
})