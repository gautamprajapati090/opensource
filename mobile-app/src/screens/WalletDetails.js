
import React from 'react';
import { WTransactionHistory } from '../components';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  Alert
} from 'react-native';
import { Header, Icon } from 'react-native-elements';
import { colors } from '../common/theme';
var { height } = Dimensions.get('window');
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { hasNotch } from '../common/utility';

export default function WalletDetails(props) {

  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const providers = useSelector(state => state.paymentmethods.providers);

  const { t } = i18n;

  const doReacharge = () => {
    if (providers) {
      props.navigation.push('addMoney', { userdata: { ...auth.info.profile, uid: auth.info.uid}, providers: providers });
    } else {
      Alert.alert(t('alert'),t('provider_not_found'))
    }
  }

  const doWithdraw = () => {
    if (parseFloat(auth.info.profile.walletBalance)>0) {
      props.navigation.push('withdrawMoney', { userdata: { ...auth.info.profile, uid: auth.info.uid} });
    } else {
      Alert.alert(t('alert'),t('wallet_zero'))
    }
  }

  const walletBar = height / 4;
  return (
    <View style={styles.mainView}>
      <Header
        backgroundColor={colors.GREY.default}
        leftComponent={{ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } }}
        rightComponent={ auth.info && auth.info.profile && auth.info.profile.usertype =='driver'?<TouchableOpacity onPress={doWithdraw}><Text style={{color:colors.WHITE}}>{t('withdraw')}</Text></TouchableOpacity>:null}
        centerComponent={<Text style={styles.headerTitleStyle}>{t('my_wallet_tile')}</Text>}
        containerStyle={[styles.headerStyle, { marginTop: auth.info.profile.usertype == 'driver' ? 0 : hasNotch ? 0 : -30 }]}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />

      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ height: walletBar, marginBottom: 12 }}>
          <View >
            <View style={{ flexDirection: 'row', justifyContent: "space-around", marginTop: 8 }}>
              <View style={{ height: walletBar - 50, width: '48%', backgroundColor: colors.GREY.whiteish, borderRadius: 8, justifyContent: 'center', flexDirection: 'column' }}>
                <Text style={{ textAlign: 'center', fontSize: 18 }}>{t('wallet_ballance')}</Text>
                <Text style={{ textAlign: 'center', fontSize: 25, fontWeight: '500', color: colors.BLUE.primary }}>{settings.symbol}{auth.info && auth.info.profile ? parseFloat(auth.info.profile.walletBalance).toFixed(2) : ''}</Text>
              </View>
              <TouchableWithoutFeedback onPress={doReacharge}>
                <View style={{ height: walletBar - 50, width: '48%', backgroundColor: colors.BLUE.primary , borderRadius: 8, justifyContent: 'center', flexDirection: 'column' }}>
                  <Icon
                    name='add-circle'
                    type='MaterialIcons'
                    color={colors.WHITE}
                    size={45}
                    iconStyle={{ lineHeight: 48 }}
                  />
                  <Text style={{ textAlign: 'center', fontSize: 18, color: colors.WHITE }}>{t('add_money')}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <View style={{ marginVertical: 10 }}>
            <Text style={{ paddingHorizontal: 10, fontSize: 18, fontWeight: '500', marginTop: 8 }}>{t('transaction_history_title')}</Text>
          </View>
        </View>

        <View style={{flex:1}}>
          <View style={{ height: '100%',paddingBottom:6}}>
            <WTransactionHistory walletHistory={auth.info.profile.walletHistory}/>
          </View>
        </View>
      </View>

    </View>
  );

}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: colors.PINK.default,
    borderBottomWidth: 0,
    // marginTop:-30

  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: 'Poppins-Bold',
    fontSize: 20
  },

  textContainer: {
    textAlign: "center"
  },
  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },

});
