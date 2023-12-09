import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ToastAndroid,
} from 'react-native';
import { useStore } from '../store/store';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import HeaderBar from '../components/HeaderBar';
import { FlatList } from 'react-native';
import LiqourCard from '../components/LiqourCard';
import { Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import LiqourData from '../data/LiqourData';

const getCategoriesFromData = (data: any) => {
  let temp: any = {};
  for (let i = 0; i < data.length; i++) {
    if (temp[data[i].name] == undefined) {
      temp[data[i].name] = 1;
    } else {
      temp[data[i].name]++;
    }
  }
  let categories = Object.keys(temp);
  categories.unshift('All');
  return categories;
};

const getLiqourList = (category: string, data: any) => {
  if (category == 'All') {
    return data;
  } else {
    let liquorlist = data.filter((item: any) => item.name == category);
    return liquorlist;
  }
};

const HomeScreen = ({navigation}: any) =>  {
  const LiqourList = useStore((state:any) => state.LiqourList);
  const AccessoryList = useStore((state:any) => state.LAccessoryList);
  const [categories, setCategories] = useState(
    getCategoriesFromData(LiqourList),
  );
  const [searchText, setSearchText] = useState('');
  const [categoryIndex, setCategoryIndex] = useState({
    index: 0,
    category: categories[0],
  });
  const [sortedLiqour, setsortedLiqour] = useState(
    getLiqourList(categoryIndex.category, LiqourList)
  );

  const ListRef: any = useRef<FlatList>();
  const tabBarHeight = useBottomTabBarHeight();

  const searchLiqour = (search: string) => {
    if (search != '') {
      ListRef?.current?.scrollToOffset({
        animated: true,
        offset: 0,
      });
      setCategoryIndex({index: 0, category: categories[0]});
      setsortedLiqour([
        ...LiqourList.filter((item: any) =>
          item.name.toLowerCase().includes(search.toLowerCase()),
        ),
      ]);
    }
  };
  
  const resetSearchLiqour= () => {ListRef?.current?.scrollToOffset({
      animated: true,
      offset: 0,
    });
    setCategoryIndex({index: 0, category: categories[0]});
    setsortedLiqour([...LiqourList]);
    setSearchText('');
  };
  const LiqourCardAddToCart = ({
    id,
    index,
    name,
    origin,
    imagelink,
    ALC,
    type,
    prices, }: any) => {
      addToCart({
        id,
        index,
        name,
        origin,
        imagelink,
        ALC,
        type,
        prices,
        });
        calculateCartPrice();
        ToastAndroid.showWithGravity(
          `${name} is Added to Cart`,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
    );
  };

  return (
    <View style={styles.ScreenContainer}>
      <StatusBar backgroundColor = {COLORS.primaryBlackHex} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ScrollViewFlex}>
          {/* App Header */}
          <HeaderBar />
         
          <Text style={styles.ScreenTitle}>
          Stuck with you{'\n'}and drunk in love
          </Text>

          {/* Search Input */}

        <View style={styles.InputContainerComponent}>
          <TouchableOpacity
            onPress={() => {
              searchLiqour(searchText);
            }}>
            <Feather 
              style={styles.InputIcon}
              name="search"
              size={FONTSIZE.size_18}
              color={
                searchText.length > 0
                  ? COLORS.primaryHotPinkHex
                  : COLORS.primaryLightGreyHex
              }
            />
          </TouchableOpacity>
          <TextInput
            placeholder="Find Your Liqour..."
            value={searchText}
            onChangeText={text => {
              setSearchText(text);
              searchLiqour(text);
            }}
            placeholderTextColor={COLORS.primaryLightGreyHex}
            style={styles.TextInputContainer}
          />
          {searchText.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                resetSearchLiqour();
              }}>
              <AntDesign
                style={styles.InputIcon}
                name="close"
                size={FONTSIZE.size_16}
                color={COLORS.primaryLightGreyHex}
              />
            </TouchableOpacity>
          ) : (
            <></>
          )}
          </View>
        </ScrollView>

        {/* Category Scroller */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.CategoryScrollViewStyle}>
          {categories.map((data, index) => (
            <View
              key={index.toString()}
              style={styles.CategoryScrollViewContainer}>
              <TouchableOpacity
                style={styles.CategoryScrollViewItem}
                onPress={() => {
                  ListRef?.current?.scrollToOffset({
                    animated: true,
                    offset: 0,
                  });
                  setCategoryIndex({index: index, category: categories[index]});
                  setsortedLiqour([
                    ...getLiqourList(categories[index], LiqourList),
                  ]);
                }}>
                <Text
                  style={[
                    styles.CategoryText,
                    categoryIndex.index == index
                      ? {color: COLORS.primaryHotPinkHex}
                      : {},
                  ]}>
                  {data}
                </Text>
                {categoryIndex.index == index ? (
                  <View style={styles.ActiveCategory} />
                ) : (
                  <></>
                )}
              </TouchableOpacity>
            </View>
          ))}
          </ScrollView>

         {/* Coffee Flatlist */}

         <FlatList
          ref={ListRef}
          horizontal
          ListEmptyComponent={
            <View style={styles.EmptyListContainer}>
              <Text style={styles.CategoryText}>No Liqour Available</Text>
            </View>
          }

          showsHorizontalScrollIndicator={false}
          data={sortedLiqour}
          contentContainerStyle={styles.FlatListContainer}
          keyExtractor={item => item.id}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  navigation.push('Details', {
                    index: item.index,
                    id: item.id,
                    type: item.type,
                  });
                }}>
                <LiqourCard
                  id={item.id}
                  index={item.index}
                  type={item.type}
                  origin={item.orgin}
                  imagelink={item.imagelink}
                  name={item.name}
                  special_ingredient={item.special_ingredient}
                  average_rating={item.average_rating}
                  price={item.prices[2]}
                  buttonPressHandler={LiqourCardAddToCart}
                  />
              </TouchableOpacity>
            );
          }}
        />

        <Text style={styles.AccessoryTitle}>Accessory</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  ScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBlackHex,
  },
  ScrollViewFlex: {
    flexGrow: 1,
  },
  ScreenTitle: {
    fontSize: FONTSIZE.size_28,
    fontFamily: FONTFAMILY.poppins_semibold,
    color: COLORS.primaryWhiteHex,
    paddingLeft: SPACING.space_30,
  },
  InputContainerComponent: {
    flexDirection: 'row',
    margin: SPACING.space_30,
    borderRadius: BORDERRADIUS.radius_20,
    backgroundColor: COLORS.primaryDarkGreyHex,
    alignItems: 'center',
  },
  InputIcon: {
    marginHorizontal: SPACING.space_20,
  },
  TextInputContainer: {
    flex: 1,
    height: SPACING.space_20 * 3,
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_14,
    color: COLORS.primaryWhiteHex,
  },
  CategoryScrollViewStyle: {
    paddingHorizontal: SPACING.space_20,
    marginBottom: SPACING.space_20,
  },
  CategoryScrollViewContainer: {
    paddingHorizontal: SPACING.space_15,
  },
  CategoryScrollViewItem: {
    alignItems: 'center',
  },
  CategoryText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryLightGreyHex,
    marginBottom: SPACING.space_4,
  },
  ActiveCategory: {
    height: SPACING.space_10,
    width: SPACING.space_10,
    borderRadius: BORDERRADIUS.radius_10,
    backgroundColor: COLORS.primaryHotPinkHex,
  },
  FlatListContainer: {
    gap: SPACING.space_20,
    paddingVertical: SPACING.space_20,
    paddingHorizontal: SPACING.space_30,
  },
  EmptyListContainer: {
    width: Dimensions.get('window').width - SPACING.space_30 * 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.space_36 * 3.6,
  },
  AccessoryTitle: {
    fontSize: FONTSIZE.size_18,
    marginLeft: SPACING.space_30,
    marginTop: SPACING.space_20,
    fontFamily: FONTFAMILY.poppins_medium,
    color: COLORS.secondaryLightGreyHex,
  },
});

export default HomeScreen;
function addToCart(arg0: { id: any; index: any; name: any; origin: any; imagelink: any; ALC: any; type: any; prices: any; }) {
  throw new Error('Function not implemented.');
}

function calculateCartPrice() {
  throw new Error('Function not implemented.');
}

