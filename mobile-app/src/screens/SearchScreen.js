import React, { useState, useContext, useEffect } from 'react';
import { Header, Icon } from 'react-native-elements';
import { colors } from '../common/theme';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import i18n from 'i18n-js';
import { FirebaseContext } from 'common/src';
import { useDispatch, useSelector } from 'react-redux';
import { hasNotch } from '../common/utility';

var { height, width } = Dimensions.get('window');

export default function SearchScreen(props) {
  const { api } = useContext(FirebaseContext);
  const { t } = i18n;
  const {
    fetchCoordsfromPlace,
    fetchPlacesAutocomplete,
    updateTripPickup,
    updateTripDrop
  } = api;
  const dispatch = useDispatch();
  const [searchResults, setSearchResults] = useState([]);
  const [isShowingResults, setIsShowingResults] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const locationType = props.navigation.getParam('locationType');
  const addParam = props.navigation.getParam('savedAddresses');
  const [loading, setLoading] = useState();
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    if (addParam.length <= 5) {
      setSavedAddresses(addParam);
    } else {
      setSavedAddresses(addParam.sort((a, b) => (a.count < b.count)).slice(0, 5));
    }
  }, []);

  const searchLocation = async (text) => {
    setSearchKeyword(text);
    if (text.length > 5) {
      const res = await fetchPlacesAutocomplete(text);
      if (res) {
        setSearchResults(res);
        setIsShowingResults(true);
      }
    }
  };
  const updateLocation = (data) => {
    setLoading(true);
    setSearchKeyword(data.description);
    setIsShowingResults(false);
    if (data.place_id) {
      fetchCoordsfromPlace(data.place_id).then((res) => {
        if (res && res.lat) {
          if (locationType == 'pickup') {
            dispatch(updateTripPickup({
              lat: res.lat,
              lng: res.lng,
              add: data.description,
              source: 'search'
            }));
          } else {
            dispatch(updateTripDrop({
              lat: res.lat,
              lng: res.lng,
              add: data.description,
              source: 'search'
            }));
          }
          setLoading(false);
          props.navigation.pop();
        } else {
          Alert.alert(t('alert'), t('place_to_coords_error'));
        }
      });
    } else {
      if (data.description) {
        if (locationType == 'pickup') {
          dispatch(updateTripPickup({
            lat: data.lat,
            lng: data.lng,
            add: data.description,
            source: 'search'
          }));
        } else {
          dispatch(updateTripDrop({
            lat: data.lat,
            lng: data.lng,
            add: data.description,
            source: 'search'
          }));
        }
        setLoading(false);
        props.navigation.pop();
      }
    }
  }

  return (
    <View style={styles.mainView}>
      <Header
        backgroundColor={colors.GREY.default}
        leftComponent={{ icon: 'angle-left', type: 'font-awesome', color: colors.WHITE, size: 35, component: TouchableWithoutFeedback, onPress: () => { props.navigation.goBack(); } }}
        centerComponent={<Text style={styles.headerTitleStyle}>{t('search')}</Text>}
        containerStyle={[styles.headerStyle, { marginTop: auth.info.profile.usertype == 'driver' ? 0 : hasNotch ? 0 : -30 }]}

      />
      <View style={{ backgroundColor: colors.WHITE, height: height - 7 }}>
        <View style={styles.autocompleteMain}>
          <Icon
            name='search'
            type='Feather'
            color={colors.GREY.default}
            size={30}
            style={{ left: 5 }} />

          <TextInput
            placeholder={t('search_for_an_address')}
            returnKeyType="search"
            style={styles.searchBox}
            placeholderTextColor="#000"
            onChangeText={(text) => searchLocation(text)}
            value={searchKeyword}
          />
        </View>
        {isShowingResults || savedAddresses ?
          <FlatList
            keyboardShouldPersistTaps='always'
            data={isShowingResults ? searchResults : savedAddresses}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => updateLocation(item)}>
                  <Text numberOfLines={1} style={styles.description}>{item.description}</Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.description}
            style={styles.searchResultsContainer}

          />
          : null}
      </View>
      {loading ?
        <View style={styles.loading}>
          <ActivityIndicator color={colors.BLACK} size='large' />
        </View>
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40
  },
  autocompleteMain: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    marginHorizontal: 15,
    flexDirection: 'row',
    marginTop: 10,
    // borderRadius:10,
    borderBottomWidth: 1
  },
  searchBox: {
    width: '90%',
    height: 50,
    fontSize: 18,
    borderColor: '#ccc',
    color: '#000',
    backgroundColor: '#fff',
    paddingLeft: 15,
    borderRadius: 10
  },
  description: {
    color: colors.BLUE.primary,
    textAlign: 'left',
    fontSize: 18,
  },
  resultItem: {
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.3,
    // backgroundColor: colors.GREY.default,
    alignItems: 'flex-start'
  },
  searchResultsContainer: {
    width: '100%',
    paddingHorizontal: 15,

    position: 'absolute',
    // marginHorizontal: 20,
    alignSelf: 'center',
    top: 70,
    // height: 100,
    width: width - 15,
    flexDirection: 'row',
    backgroundColor: colors.WHITE,
    paddingLeft: 10,
    paddingRight: 10,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    borderRadius: 8,
    elevation: 3
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
})
