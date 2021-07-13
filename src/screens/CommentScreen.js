/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import {AuthContext} from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import firebase from '@react-native-firebase/app';

let list = [];
const CommentScreen = ({navigation, route}) => {
  const {user} = useContext(AuthContext);
  const [comment, setComment] = useState('');
  const [arrayComment, setArrayComment] = useState(null);
  const [me, setMe] = useState(null);
  const [onLoad, setOnLoad] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getUser();
    getListComments();
    return () => {
      list = [];
    };
  }, [onLoad]);
  const getUser = async () => {
    try {
      const test = await firestore().collection('users').doc(user.uid).get();
      console.log('user', test._data);
      setMe(test._data);
    } catch (error) {
      console.log('error', error);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    getListComments();
    setRefreshing(false);
  };
  const getListComments = async () => {
    try {
      const response = await firestore()
        .collection('posts')
        .doc(route.params.postId)
        .get();
      console.log(response._data.comments);
      list = [...response._data.comments];
      console.log('list', list);
      setArrayComment(response._data.comments);
    } catch (error) {
      console.log('error', error);
    }
  };
  const postComment = async () => {
    list.push({
      comment: comment,
      user: `${me.fname} ${me.lname}`,
      avatar: me.userImg,
    });
    try {
      setOnLoad(!onLoad);
      firestore()
        .collection('posts')
        .doc(route.params.postId)
        .set({comments: list}, {merge: true});
      setOnLoad(!onLoad);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View style={styles.container}>
      <View style={{width: '100%', height: '80%'}}>
        <FlatList
          data={arrayComment}
          renderItem={({item, index}) => (
            <View style={styles.item}>
              <View
                style={{
                  alignItems: 'center',
                  width: '15%',
                  marginTop: 5,
                }}>
                <Image
                  style={{width: 30, height: 30, borderRadius: 15}}
                  source={
                    item.avatar
                      ? {uri: item.avatar}
                      : require('../assets/defaultAvatar.png')
                  }
                />
              </View>
              <View
                style={{
                  width: '85%',
                  backgroundColor: '#E0E0E0',
                  borderRadius: 5,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginTop: 5,
                    marginLeft: 5,
                  }}>
                  {item.user}
                </Text>
                <Text style={{fontSize: 14, marginTop: 10, marginLeft: 5}}>
                  {item.comment}
                </Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl
              progressViewOffset={100}
              refreshing={refreshing}
              onRefresh={() => onRefresh()}
              colors={['red', 'blue', 'white']}
              tintColor="white"
            />
          }
          keyExtractor={(index, key) => `${key}`}
        />
      </View>
      <View style={styles.add}>
        <TextInput
          value={comment}
          style={styles.textInput}
          placeholder="Comment"
          onChangeText={setComment}
        />
        <TouchableOpacity onPress={postComment}>
          <View style={styles.button}>
            <Text style={styles.text}>ADD COMMENT</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    borderColor: 'grey',
    borderWidth: 1,
    width: '100%',
  },
  button: {
    backgroundColor: '#40BFFF',
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  item: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  square: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 13,
    shadowColor: 'black',
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  wrapContainer: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
export default CommentScreen;
