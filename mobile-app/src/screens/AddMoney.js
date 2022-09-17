
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  TextInput,
  FlatList
} from 'react-native';
import { Button, Header } from 'react-native-elements';
import { colors } from '../common/theme';

import i18n from 'i18n-js';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { hasNotch } from '../common/utility';

export default function AddMoneyScreen(props) {

  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);

  const [state, setState] = useState({
    userdata: props.navigation.getParam('userdata'),
    providers: props.navigation.getParam('providers'),
    amount: '5',
    qickMoney: [{ amount: '5', selected: false }, { amount: '10', selected: false }, { amount: '20', selected: false }, { amount: '50', selected: false }, { amount: '100', selected: false }],
  });

  const quckAdd = (index) => {
    let quickM = state.qickMoney;
    for (let i = 0; i < quickM.length; i++) {
      quickM[i].selected = false;
      if (i == index) {
        quickM[i].selected = true;
      }
    }
    setState({
      ...state,
      amount: quickM[index].amount,
      qickMoney: quickM
    })
  }

  const payNow = () => {
    var d = new Date();
    var time = d.getTime();
    let payData = {
      email: state.userdata.email,
      amount: state.amount,
      order_id: "wallet-" + state.userdata.uid + "-" + time.toString(),
      name: t('add_money'),
      description: t('wallet_ballance'),
      currency: settings.code,
      quantity: 1,
      paymentType: 'walletCredit'
    }
    if (payData) {
      props.navigation.navigate("paymentMethod", {
        payData: payData,
        userdata: state.userdata,
        settings: state.settings,
        providers: state.providers
      });
    }
  }

  const newData = ({ item, index }) => {
    return (
      <TouchableOpacity style={[styles.boxView, { backgroundColor: item.selected ? colors.GREY.default : colors.GREY.primary }]} onPress={() => { quckAdd(index); }}><Text style={[styles.quckMoneyText, { color: item.selected ? colors.WHITE : colors.BLACK }]} >{settings.symbol}{item.amount}</Text></TouchableOpacity>
    )
  }


  //go back
  const goBack = () => {
    props.navigation.goBack();
  }

  const { t } = i18n;

  return (
    <View style={styles.mainView}>
      <Header
        backgroundColor={colors.GREY.default}
        leftComponent={{ icon: 'ios-arrow-back', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { goBack() } }}
        centerComponent={<Text style={styles.headerTitleStyle}>{t('add_money_tile')}</Text>}
        containerStyle={[styles.headerStyle, { marginTop: auth.info.profile.usertype == 'driver' ? 0 : hasNotch ? 0 : -30 }]}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />

      <View style={styles.bodyContainer}>
        <Text style={styles.walletbalText}>{t('Balance')} - <Text style={styles.ballance}>{settings.symbol}{state.userdata ? parseFloat(state.userdata.walletBalance).toFixed(2) : ''}</Text></Text>

        <TextInput
          style={styles.inputTextStyle}
          placeholder={t('addMoneyTextInputPlaceholder') + " (" + settings.symbol + ")"}
          keyboardType={'number-pad'}
          onChangeText={(text) => setState({ ...state, amount: text })}
          value={state.amount}
        />
        <View style={styles.quickMoneyContainer}>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={state.qickMoney}
            renderItem={newData}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        {/* <TouchableOpacity
          style={styles.buttonWrapper2}
          onPress={payNow}>
          <Text style={styles.buttonTitle}>{t('add_money_tile')}</Text>
        </TouchableOpacity> */}

        <View style={styles.buttonContainer}>
          <Button
            onPress={payNow}
            title={t('add_money_tile')}
            // loading={loading}
            titleStyle={styles.buttonTitle}
            buttonStyle={styles.registerButton}
          />
        </View>
      </View>
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
    fontSize: 17,
    fontFamily: "Poppins-Regular",
  },
  ballance: {
    fontWeight: 'bold'
  },
  inputTextStyle: {
    marginTop: 10,
    height: 50,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    fontSize: 30,
    fontFamily: "Poppins-Regular",
  },
  buttonContainer: {
    justifyContent: 'center',
    width: '100%',
  },
  registerButton: {
    backgroundColor: colors.PINK.primary,
    width: '100%',
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
    fontFamily: "Poppins-Regular",
  }
});
