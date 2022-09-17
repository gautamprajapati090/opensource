import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Modal,
  Alert
} from 'react-native';
import { Header, CheckBox } from 'react-native-elements';
import { colors } from '../common/theme';
var { width, height } = Dimensions.get('window');
import { PromoComp } from "../components";
import i18n from 'i18n-js';
import { useSelector, useDispatch } from 'react-redux';
import { FirebaseContext } from 'common/src';
import { Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment/min/moment-with-locales';
import { hasNotch } from '../common/utility';

export default function PaymentDetails(props) {
  const { api, appcat } = useContext(FirebaseContext);
  const {
    updateBooking,
    updateWalletBalance,
    cancelBooking,
    editPromo
  } = api;
  const dispatch = useDispatch();
  const userdata = useSelector(state => state.auth.info.profile);
  const uid = useSelector(state => state.auth.info.uid);
  const settings = useSelector(state => state.settingsdata.settings);
  const providers = useSelector(state => state.paymentmethods.providers);
  const walletBalance = useSelector(state => state.auth.info.profile.walletBalance);
  const role = useSelector(state => state.auth.info.profile.usertype);
  const booking = props.navigation.getParam('booking');

  const [promodalVisible, setPromodalVisible] = useState(false);
  const [useWalletCash, setUseWalletCash] = useState(false);
  const { t } = i18n;

  const [payDetails, setPayDetails] = useState({
    amount: booking.trip_cost,
    discount: booking.discount ? booking.discount : 0,
    usedWalletMoney: booking.usedWalletMoney ? booking.usedWalletMoney : 0,
    promo_applied: booking.promo_applied ? booking.promo_applied : false,
    promo_details: booking.promo_details ? booking.promo_details : null,
    payableAmount: booking.payableAmount ? booking.payableAmount : booking.trip_cost
  });

  const useWallet = () => {
    let res = !useWalletCash;
    setUseWalletCash(res);
    if (res) {
      if (parseFloat(walletBalance) >= parseFloat(payDetails.payableAmount)) {
        let data = { ...payDetails };
        data.usedWalletMoney = parseFloat(data.payableAmount).toFixed(2);
        data.payableAmount = 0;
        setPayDetails(data);
      } else {
        let data = { ...payDetails };
        data.usedWalletMoney = parseFloat(walletBalance);
        data.payableAmount = (parseFloat(data.payableAmount) - parseFloat(walletBalance)).toFixed(2);
        setPayDetails(data);
      }
    } else {
      let data = { ...payDetails };
      data.payableAmount = parseFloat((parseFloat(data.payableAmount) + parseFloat(data.usedWalletMoney)).toFixed(2));
      data.usedWalletMoney = 0;
      setPayDetails(data);
    }
  }

  const promoModal = () => {
    return (
      <Modal
        animationType="none"
        visible={promodalVisible}
        onRequestClose={() => {
          setPromodalVisible(false);
        }}>
        <Header
          backgroundColor={colors.PINK.primary}
          rightComponent={{ icon: 'ios-close', type: 'ionicon', color: colors.WHITE, size: 40, component: TouchableWithoutFeedback, onPress: () => { setPromodalVisible(false) } }}
          centerComponent={<Text style={styles.headerTitleStyle}>{t('your_promo')}</Text>}
          containerStyle={[styles.headerStyle, { marginTop: role == 'driver' ? 0 : hasNotch ? 0 : -30 }]}
          innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
        />
        <PromoComp onPressButton={(item, index) => { selectCoupon(item, index) }}></PromoComp>
      </Modal>
    )
  }

  const openPromoModal = () => {
    setPromodalVisible(!promodalVisible);
    let data = { ...payDetails };
    data.payableAmount = data.amount;
    data.discount = 0;
    data.promo_applied = false;
    data.promo_details = null;
    data.usedWalletMoney = 0;
    setPayDetails(data);
    setUseWalletCash(false);
  }

  const removePromo = () => {
    let data = { ...payDetails };
    data.promo_details.user_avail = parseInt(data.promo_details.user_avail) - 1;
    delete data.promo_details.usersUsed[uid];
    dispatch(editPromo(data.promo_details));
    data.payableAmount = data.amount;
    data.discount = 0;
    data.promo_applied = false;
    data.promo_details = null;
    data.usedWalletMoney = 0;
    setPayDetails(data);
    setUseWalletCash(false);
  }

  const doPayment = (payment_mode) => {

    if (payment_mode == 'cash' || payment_mode == 'wallet') {
      let curBooking = { ...booking };
      if (booking.status == "PAYMENT_PENDING") {
        curBooking.status = 'NEW';
      } else {
        curBooking.status = 'PAID';
      }
      curBooking.payment_mode = payment_mode;
      curBooking.customer_paid = curBooking.status == 'NEW' ? parseFloat(payDetails.usedWalletMoney).toFixed(2) : ((parseFloat(payDetails.amount) - parseFloat(payDetails.discount)).toFixed(2));
      curBooking.discount_amount = parseFloat(payDetails.discount).toFixed(2);
      curBooking.usedWalletMoney = parseFloat(payDetails.usedWalletMoney).toFixed(2);
      curBooking.cardPaymentAmount = 0;
      curBooking.cashPaymentAmount = curBooking.status == 'NEW' ? 0 : (parseFloat(payDetails.amount) - (parseFloat(payDetails.usedWalletMoney) + parseFloat(payDetails.discount))).toFixed(2);
      curBooking.payableAmount = parseFloat(payDetails.payableAmount).toFixed(2);
      curBooking.promo_applied = payDetails.promo_applied;
      curBooking.promo_details = payDetails.promo_details;
      dispatch(updateBooking(curBooking));

      if (payDetails.usedWalletMoney > 0 && (booking.status == "PAYMENT_PENDING" || (appcat == 'taxi' && booking.status == "PENDING"))) {
        let walletBalance = parseFloat(userdata.walletBalance) - parseFloat(payDetails.usedWalletMoney);
        let tDate = new Date();
        let details = {
          type: 'Debit',
          amount: payDetails.usedWalletMoney,
          date: tDate.toString(),
          txRef: booking.id
        }
        dispatch(updateWalletBalance(walletBalance, details));
      }
      if (userdata.usertype == 'rider') {
        if (curBooking.status == 'NEW') {
          props.navigation.navigate('BookedCab', { bookingId: booking.id });
        } else {
          props.navigation.navigate('DriverRating', { bookingId: booking.id });
        }
      } else {
        props.navigation.navigate('DriverTrips');
      }
    } else {
      let curBooking = { ...booking };
      if (userdata.usertype == 'rider') {

        let payData = {
          first_name: userdata.firstName,
          last_name: userdata.lastName,
          email: userdata.email,
          email: userdata.email,
          amount: payDetails.payableAmount,
          order_id: booking.id,
          name: t('bookingPayment'),
          description: t('order_id') + booking.id,
          currency: settings.code,
          quantity: 1
        }

        const paymentPacket = {
          appcat: appcat,
          payment_mode: payment_mode,
          customer_paid: (parseFloat(payDetails.amount) - parseFloat(payDetails.discount)).toFixed(2),
          discount_amount: parseFloat(payDetails.discount).toFixed(2),
          usedWalletMoney: parseFloat(payDetails.usedWalletMoney).toFixed(2),
          cardPaymentAmount: parseFloat(payDetails.payableAmount).toFixed(2),
          cashPaymentAmount: 0,
          payableAmount: parseFloat(payDetails.payableAmount).toFixed(2),
          promo_applied: payDetails.promo_applied,
          promo_details: payDetails.promo_details
        };

        curBooking.paymentPacket = paymentPacket;
        dispatch(updateBooking(curBooking));
        setTimeout(() => {
          props.navigation.navigate("paymentMethod", {
            payData: payData,
            userdata: userdata,
            settings: settings,
            providers: providers,
            booking: curBooking
          });
        }, 1000);
      } else {
        if (booking.status != "PAYMENT_PENDING") {
          curBooking.status = 'PENDING';
        }
        dispatch(updateBooking(curBooking));
        props.navigation.navigate('DriverTrips');
      }

    }
  }

  const selectCoupon = (item, index) => {
    var toDay = new Date();
    var expDate = new Date(item.promo_validity)
    expDate.setDate(expDate.getDate() + 1);
    item.usersUsed = item.usersUsed ? item.usersUsed : {};
    if (payDetails.amount < item.min_order) {
      Alert.alert(t('alert'), t('promo_eligiblity'))
    } else if (item.user_avail && item.user_avail >= item.promo_usage_limit) {
      Alert.alert(t('alert'), t('promo_exp_limit'))
    } else if (item.usersUsed[uid]) {
      Alert.alert(t('alert'), t('promo_used'))
    } else if (toDay > expDate) {
      Alert.alert(t('alert'), t('promo_exp'))
    } else {
      let discounttype = item.promo_discount_type.toUpperCase();
      if (discounttype == 'PERCENTAGE') {
        let discount = parseFloat(payDetails.amount * item.promo_discount_value / 100).toFixed(2);
        if (discount > item.max_promo_discount_value) {
          let discount = item.max_promo_discount_value;
          let data = { ...payDetails };
          data.discount = discount
          data.promo_applied = true
          item.user_avail = item.user_avail ? parseInt(item.user_avail) + 1 : 1;
          item.usersUsed[uid] = true;
          dispatch(editPromo(item));
          data.promo_details = item
          data.payableAmount = parseFloat(data.payableAmount - discount).toFixed(2);
          setPayDetails(data);
          setPromodalVisible(false);
        } else {
          let data = { ...payDetails };
          data.discount = discount
          data.promo_applied = true
          item.user_avail = item.user_avail ? parseInt(item.user_avail) + 1 : 1;
          item.usersUsed[uid] = true;
          dispatch(editPromo(item));
          data.promo_details = item,
            data.payableAmount = parseFloat(data.payableAmount - discount).toFixed(2);
          setPayDetails(data);
          setPromodalVisible(false);
        }
      } else {
        let discount = item.max_promo_discount_value;
        let data = { ...payDetails };
        data.discount = discount
        data.promo_applied = true
        item.user_avail = item.user_avail ? parseInt(item.user_avail) + 1 : 1;
        item.usersUsed[uid] = true;
        dispatch(editPromo(item));
        data.promo_details = item,
          data.payableAmount = parseFloat(data.payableAmount - discount).toFixed(2);
        setPayDetails(data);
        setPromodalVisible(false);
      }
    }

  }

  const cancelCurBooking = () => {
    Alert.alert(
      t('alert'),
      t('cancel_confirm'),
      [
        { text: t('cancel'), onPress: () => { }, style: 'cancel' },
        {
          text: t('ok'), onPress: () => {
            payDetails.promo_applied ? removePromo() : null;
            dispatch(
              cancelBooking(
                {
                  booking: booking,
                  reason: t('cancelled_incomplete_booking'),
                  cancelledBy: userdata.usertype
                }
              )
            );
            props.navigation.navigate('Map');
          }
        },
      ]
    );
  };

  return (
    <View style={styles.mainView}>
      <Header
        backgroundColor={colors.GREY.default}
        leftComponent={{ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } }}
        centerComponent={<Text style={styles.headerTitleStyle}>{t('payment')}</Text>}
        rightComponent={userdata && userdata.usertype == 'rider' && booking.status == 'PAYMENT_PENDING' ? <TouchableOpacity onPress={cancelCurBooking}><Text style={{ color: colors.WHITE }}>{t('cancel')}</Text></TouchableOpacity> : null}
        containerStyle={[styles.headerStyle, { marginTop: role == 'driver' ? 0 : hasNotch ? 0 : -30 }]}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollStyle}>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 15, paddingRight: 15, marginBottom: 4 }}>
            <Text style={{ color: colors.BLUE.primary, textAlign: 'left', lineHeight: 45, fontSize: 20, fontFamily: 'Poppins-Medium' }}>{t('bill_details')}</Text>
            {userdata && userdata.usertype == 'rider' && (booking.status == 'PAYMENT_PENDING' || (appcat == 'taxi' && booking.status == "PENDING")) ?
              payDetails.promo_applied ?
                <TouchableOpacity
                  onPress={() => { removePromo() }}>
                  <Text style={{ color: 'red', textAlign: 'left', lineHeight: 45, fontSize: 14, fontFamily: 'Poppins-Medium' }}>{t('remove_promo')}</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity
                  onPress={() => { openPromoModal() }}>
                  <Text style={{ color: colors.GREEN.bright, textAlign: 'left', lineHeight: 45, fontSize: 14, fontFamily: 'Poppins-Medium' }}>{t('apply_promo')}</Text>
                </TouchableOpacity>
              : null}
          </View>
          {userdata && userdata.usertype == 'driver' ?
            <View style={{ flex: 1, paddingHorizontal: 15 }}>
              {booking && booking.pickup ?
                <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                  <MaterialCommunityIcons
                    name='map-marker'
                    size={24}
                    color='#ea4b6a'
                    style={styles.marker}
                  />
                  <View style={{ flexDirection: 'column', flex: 1 }}>
                    <Text style={{ ...styles.text, fontSize: 15 }}>{booking.pickup.add}</Text>
                    {booking && booking.startTime ?
                      <View>
                        <Text style={styles.text2}>{booking.startTime ? moment(booking.startTime).format('llll') : ''}</Text>
                      </View>
                      : null}
                  </View>
                </View>
                : null}

              {booking && booking.drop ?
                <View style={{ flexDirection: 'row' }}>
                  <MaterialCommunityIcons
                    name='map-marker'
                    size={24}
                    color='#00d362'
                    style={styles.marker}
                  />
                  <View style={{ flexDirection: 'column', flex: 1 }}>
                    <Text style={{ ...styles.text, fontSize: 15 }}>{booking.drop.add}</Text>
                    {booking && booking.endTime ?
                      <View>
                        <Text style={styles.text2}>{booking.endTime ? moment(booking.endTime).format('llll') : ''}</Text>
                      </View>
                      : null}
                  </View>
                </View>
                : null}

            </View>
            : null}

          {userdata && userdata.usertype == 'driver' ?
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 10 }}>
              <Text style={{ color: colors.BLUE.primary, textAlign: 'left', lineHeight: 30, fontSize: 16 }}>{t('distance')}</Text>
              <Text style={{ color: colors.BLUE.primary, textAlign: 'left', lineHeight: 30, fontSize: 16 }}>
                {
                  (booking && booking.distance ? booking.distance : '0') + ' ' + (settings && settings.convert_to_mile ? t('mile') : t('km'))
                }
              </Text>
            </View>
            : null}
          {userdata && userdata.usertype == 'driver' ?
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 }}>
              <Text style={{ color: colors.BLUE.primary, textAlign: 'left', lineHeight: 30, fontSize: 16 }}>{t('total_time')}</Text>
              <Text style={{ color: colors.BLUE.primary, textAlign: 'left', lineHeight: 30, fontSize: 16 }}>{(booking && booking.total_trip_time ? parseFloat(booking.total_trip_time / 60).toFixed(1) : '0') + ' ' + t('mins')}</Text>
            </View>
            : null}
          {userdata && userdata.usertype == 'driver' ?
            <View style={{
              borderStyle: 'dotted',
              borderWidth: 0.5,
              borderRadius: 1,
              marginVertical: 10
            }}>
            </View>
            : null}

          {userdata ?
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 }}>
              <Text style={{ color: colors.BLUE.primary, textAlign: 'left', lineHeight: 30, fontSize: 16 }}>{userdata.usertype == 'rider' ? t('your_fare') : t('total_fare')}</Text>
              <Text style={{ color: colors.BLUE.primary, textAlign: 'left', lineHeight: 30, fontSize: 16 }}>{settings.symbol} {parseFloat(payDetails.amount).toFixed(2)}</Text>
            </View>
            : null
          }
          {userdata ?
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 }}>
              <Text style={{ color: colors.BLUE.primary, textAlign: 'left', lineHeight: 30, fontSize: 16 }}>{t('promo_discount')}</Text>
              <Text style={{ color: colors.DULL_RED, textAlign: 'left', lineHeight: 30, fontSize: 16 }}>- {settings.symbol} {payDetails ? payDetails.discount ? parseFloat(payDetails.discount).toFixed(2) : '0.00' : '0.00'}</Text>
            </View>
            : null}
          {useWalletCash || (booking.status != 'PAYMENT_PENDING' && booking.usedWalletMoney) ?
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 }}>
              <Text style={{ color: colors.BLUE.primary, textAlign: 'left', lineHeight: 30, fontSize: 16 }}>{t('WalletPayment')}</Text>
              <Text style={{ color: colors.DULL_RED, textAlign: 'left', lineHeight: 30, fontSize: 16 }}>- {settings.symbol} {payDetails ? payDetails.usedWalletMoney ? parseFloat(payDetails.usedWalletMoney).toFixed(2) : '0.00' : '0.00'}</Text>
            </View> : null}

          {userdata && userdata.usertype == 'rider' && (booking.status == 'PAYMENT_PENDING' || (appcat == 'taxi' && booking.status == "PENDING")) ?
            <View style={{ flex: 1, paddingHorizontal: 5 }}>
              <CheckBox
                center
                disabled={parseFloat(walletBalance) > 0 ? false : true}
                title={t('use_wallet_balance') + settings.symbol + (parseFloat(walletBalance) - parseFloat(payDetails.usedWalletMoney)).toFixed(2) + ')'}
                checked={useWalletCash}
                textStyle={{ color: colors.BLUE.primary }}
                containerStyle={{ backgroundColor: colors.WHITE, borderWidth: 0, borderColor: colors.WHITE, alignSelf: 'flex-start' }}
                onPress={() => { useWallet() }}>
              </CheckBox>
            </View>
            : null}

          {userdata ?
            <View style={{
              borderStyle: 'dotted',
              borderWidth: 0.5,
              borderRadius: 1,
              marginVertical: 10
            }}>
            </View>
            : null}
          {userdata ?
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 }}>
              <Text style={{ color: colors.BLUE.primary, textAlign: 'left', lineHeight: 45, fontSize: 24, fontFamily: 'Poppins-Medium' }}>{t('payable_ammount')}</Text>
              <Text style={{ color: colors.BLUE.primary, textAlign: 'left', lineHeight: 45, fontSize: 24, fontFamily: 'Poppins-Bold' }}>{settings.symbol} {payDetails.payableAmount ? parseFloat(payDetails.payableAmount).toFixed(2) : 0.00}</Text>
            </View>
            : null}
          <Text style={{ color: colors.BLUE.primary, textAlign: 'left', fontSize: 14, fontFamily: 'Poppins-Regular', paddingHorizontal: 15, paddingVertical: 10 }}><Text style={{ fontFamily: 'Poppins-Medium' }}>Note:</Text> This is the total fare of your ride. It might change if you change your drop or route.</Text>

        </View>
        {payDetails.payableAmount == 0 ?
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonWrapper2}
              onPress={() => {
                doPayment('wallet');
              }}>
              <Text style={styles.buttonTitle}>{userdata && userdata.usertype == 'rider' ? t('paynow_button') : t('ok')}</Text>
            </TouchableOpacity>
          </View>
          :
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={() => {
                doPayment('cash');
              }}>
              <Text style={styles.buttonTitle}>{booking.status == 'PAYMENT_PENDING' ? t('cash_on_delivery') : t('pay_cash')}</Text>
            </TouchableOpacity>
            {providers && providers.length > 0 ?
              <TouchableOpacity
                style={styles.cardPayBtn}
                onPress={() => {
                  doPayment('card');
                }}>
                <Text style={styles.buttonTitle}>{userdata && userdata.usertype == 'rider' ? t('payWithCard') : t('request_payment')}</Text>
              </TouchableOpacity>
              : null}
          </View>
        }

      </ScrollView>
      {
        promoModal()
      }
    </View>
  );

}

const styles = StyleSheet.create({

  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
    //marginTop: StatusBar.currentHeight 
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
  scrollStyle: {
    flex: 1,
    height: height,
    backgroundColor: colors.WHITE
  },
  container: {
    flex: 1,
    marginTop: 5,
    backgroundColor: 'white',
  },
  buttonContainer: {
    // flex: 1,
    // width: '100%',
    //position: 'absolute',
    //bottom: 10
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 10
  },

  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
    //marginBottom: 15,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BLUE.primary,
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 15

  },
  cardPayBtn: {
    flex: 1,
    marginHorizontal: 5,
    //marginBottom: 15,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.PINK.primary,
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 15

  },
  buttonWrapper2: {
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 10,
    marginTop: 20,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BLUE.primary,
    borderRadius: 8,
    width: '90%'
  },
  buttonTitle: {
    color: colors.WHITE,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  newname: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailInputContainer: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingLeft: 10,
    backgroundColor: colors.WHITE,
    paddingRight: 10,
    paddingTop: 10,
    width: width - 80
  },
  errorMessageStyle: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  inputTextStyle: {
    color: colors.BLACK,
    fontSize: 16
  },
  pinbuttonStyle: { elevation: 0, bottom: 15, width: '80%', alignSelf: "center", borderRadius: 20, borderColor: "transparent", backgroundColor: colors.GREY.btnPrimary, },
  pinbuttonContainer: { flex: 1, justifyContent: 'center' },
  inputContainer: { flex: 3, justifyContent: "center", marginTop: 40 },
  pinheaderContainer: { height: 250, backgroundColor: colors.WHITE, width: '80%', justifyContent: 'space-evenly' },
  pinheaderStyle: { flex: 1, flexDirection: 'column', backgroundColor: colors.GREY.default, justifyContent: "center" },
  forgotPassText: { textAlign: "center", color: colors.WHITE, fontSize: 20, width: "100%" },
  pinContainer: { flexDirection: "row", justifyContent: "space-between" },
  forgotStyle: { flex: 3, justifyContent: "center", alignItems: 'center' },
  crossIconContainer: { flex: 1, left: '40%' },
  forgot: { flex: 1 },
  pinbuttonTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    width: '100%',
    textAlign: 'center'
  },
  newname2: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  emailInputContainer2: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingLeft: 10,
    backgroundColor: colors.WHITE,
    paddingRight: 10,
    paddingTop: 10,
    width: width - 80,

  },

  inputTextStyle2: {
    color: colors.BLACK,
    fontSize: 14
  },
  buttonStyle2: { elevation: 0, bottom: 15, width: '80%', alignSelf: "center", borderRadius: 20, borderColor: "transparent", backgroundColor: colors.GREY.btnPrimary, },
  buttonContainer2: { flex: 1, justifyContent: 'center', marginTop: 5 },
  inputContainer2: { flex: 4, paddingBottom: 25 },
  headerContainer2: { height: 380, backgroundColor: colors.WHITE, width: '80%', justifyContent: 'center' },
  headerStyle2: { flex: 1, flexDirection: 'column', backgroundColor: colors.GREY.default, justifyContent: "center" },
  forgotPassText2: { textAlign: "center", color: colors.WHITE, fontSize: 16, width: "100%" },
  forgotContainer2: { flexDirection: "row", justifyContent: "space-between" },
  forgotStyle2: { flex: 3, justifyContent: "center" },
  crossIconContainer2: { flex: 1, left: '40%' },
  forgot2: { flex: 1 },
  buttonTitle2: {
    fontWeight: 'bold',
    fontSize: 16,
    width: '100%',
    textAlign: 'center'
  },

  containercvv: {
    flex: 1,
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingTop: 120
  },
  modalContainercvv: {
    height: 200,
    backgroundColor: colors.WHITE,
    width: "80%",
    borderRadius: 10,
    elevation: 15
  },
  crossIconContainercvv: {
    flex: 1,
    left: "40%"
  },
  blankViewStylecvv: {
    flex: 1,
    flexDirection: "row",
    alignSelf: 'flex-end',
    marginTop: 15,
    marginRight: 15
  },
  blankViewStyleOTP: {
    flex: 1,
    flexDirection: "row",
    alignSelf: 'flex-end',

  },
  modalHeaderStylecvv: {
    textAlign: "center",
    fontSize: 20,
    paddingTop: 10
  },
  modalContainerViewStylecvv: {
    flex: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  itemsViewStylecvv: {
    flexDirection: "column",
    // justifyContent: "space-between"
  },
  textStylecvv: {
    fontSize: 20
  },
  inputcvv: {
    fontSize: 20,
    marginBottom: 20,
    borderColor: colors.GREY.Smoke_Grey,
    borderWidth: 1,
    borderRadius: 8,
    width: "80%",
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 10,
    paddingLeft: 10,
    textAlign: 'center'
  },
  location: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6
  },
  timeStyle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    marginTop: 1
  },
  greenDot: {
    backgroundColor: colors.GREEN.default,
    width: 10,
    height: 10,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginTop: 5
  },
  redDot: {
    backgroundColor: colors.RED,
    width: 10,
    height: 10,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginTop: 5
  },
  address: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: 0,
    marginLeft: 6
  },
  adressStyle: {
    marginLeft: 6,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  marker: {
    marginLeft: 0,
    marginTop: 0,
    alignSelf: 'center',
  },
  text: {
    fontSize: 16,
    color: colors.BLUE.primary,
    textAlign: 'left',
    fontFamily: 'Poppins-Medium',
    marginLeft: 15,
    marginRight: 0,
  },
  text2: {
    fontSize: 14,
    color: colors.BLUE.primary,
    textAlign: 'left',
    fontFamily: 'Poppins-Regular',
    marginLeft: 15,
    marginRight: 0,
  },
});