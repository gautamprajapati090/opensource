import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  TextInput,
  Alert
} from 'react-native';
import { Header, Button } from 'react-native-elements';
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import { useSelector,useDispatch } from 'react-redux';
import { FirebaseContext } from 'common/src';
import { hasNotch } from '../common/utility';

export default function WithdrawMoneyScreen(props) {
  const { api } = useContext(FirebaseContext);
  const {
    updateWalletBalance
  } = api;
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const [state, setState] = useState({
    userdata: props.navigation.getParam('userdata'),
    amount: null
  });
  const [loading,setLoading] = useState(false);

  const { t } = i18n;

  const withdrawNow = () => {
    if(parseFloat(state.userdata.walletBalance)>0 && parseFloat(state.amount)> 0 && parseFloat(state.amount)<=parseFloat(state.userdata.walletBalance)){
      let walletBalance = parseFloat(state.userdata.walletBalance) - parseFloat(state.amount);
      let tDate = new Date();
      let details = {
        type: 'Withdraw',
        amount: parseFloat(state.amount),
        date: tDate.toString(),
        txRef: tDate.getTime().toString(),
        transaction_id: tDate.getTime().toString()
      }
      dispatch(updateWalletBalance(walletBalance,details));
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        props.navigation.navigate('wallet');
      }, 2000);
    }else{
      if(parseFloat(state.amount)> parseFloat(state.userdata.walletBalance)){
        Alert.alert(t('alert'),t('withdraw_more'));
      }
      else if(parseFloat(state.amount)<=0){
        Alert.alert(t('alert'),t('withdraw_below_zero'));
      }else{
        Alert.alert(t('alert'),t('valid_amount'));
      }
    }
  }

  //go back
  const goBack = () => {
    props.navigation.goBack();
  }

  return (
    <View style={styles.mainView}>
      <Header
        backgroundColor={colors.GREY.default}
        leftComponent={{ icon: 'ios-arrow-back', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { goBack() } }}
        centerComponent={<Text style={styles.headerTitleStyle}>{t('withdraw_money')}</Text>}
        containerStyle={[styles.headerStyle, { marginTop: auth.info.profile.usertype == 'driver' ? 0 : hasNotch ? 0 : -30 }]}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />

      <View style={styles.bodyContainer}>
        <Text style={styles.walletbalText}>{t('Balance')} - <Text style={styles.ballance}>{settings.symbol}{state.userdata ? parseFloat(state.userdata.walletBalance).toFixed(2) : ''}</Text></Text>

        <TextInput
          style={styles.inputTextStyle}
          placeholder={t('amount') + " (" + settings.symbol + ")"}
          keyboardType={'number-pad'}
          onChangeText={(text) => setState({ ...state,amount: text })}
          value={state.amount}
        />
        <Button
            title={t('withdraw')}
            loading={loading}
            titleStyle={styles.buttonTitle}
            onPress={withdrawNow}
            buttonStyle={styles.buttonWrapper2}
            containerStyle={{ height: '100%' }}
        />
      </View>
    </View>
  );

}

const styles = StyleSheet.create({

  headerStyle: {
    backgroundColor: colors.PINK.default,
    borderBottomWidth: 0,
    marginTop:-30
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: 'Poppins-Bold',
    fontSize: 20
  },

  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  bodyContainer: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 10,
    paddingHorizontal: 12
  },
  walletbalText: {
    fontSize: 17
  },
  ballance: {
    fontWeight: 'bold'
  },
  inputTextStyle: {
    marginTop: 10,
    height: 50,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    fontSize: 30
  },
  buttonWrapper2: {
    marginBottom: 10,
    marginTop: 18,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.PINK.primary,
    borderRadius: 8,
  },
  buttonTitle: {
    color: colors.WHITE,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  quickMoneyContainer: {
    marginTop: 18,
    flexDirection: 'row',
    paddingVertical: 4,
    paddingLeft: 4,
  },
  boxView: {
    height: 40,
    width: 60,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  quckMoneyText: {
    fontSize: 16,
  }

});
