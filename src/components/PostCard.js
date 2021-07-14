/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useContext, useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ProgressiveImage from './ProgressiveImage';
import {StyleSheet} from 'react-native';
import {AuthContext} from '../navigation/AuthProvider';

import moment from 'moment';
import {TouchableOpacity} from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import {View, Image, Text} from 'react-native';

const PostCard = ({item, onDelete, onPress, onComment}) => {
  const {user} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [like, setLike] = useState(
    item.likes.some((i) => i.userID.includes(user.uid)),
  );
  const [likes, setLikes] = useState(item.likes);
  const [likeLegth, setLikeLegth] = useState(item.likes.length);
  const likeIcon = like ? 'heart' : 'heart-outline';
  const likeIconColor = like ? '#2e64e5' : '#333';
  useEffect(() => {
    getUser();
  }, []);
  console.log(item.likes);
  const getUser = async () => {
    await firestore()
      .collection('users')
      .doc(item.userId)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          setUserData(documentSnapshot.data());
        }
      });
  };

  const liked = async (arr) => {
    try {
      await firestore()
        .collection('posts')
        .doc(item.id)
        .set({likes: arr}, {merge: true});
    } catch (error) {
      console.log(error);
    }
  };

  const onLike = () => {
    const listLike = likes;
    if (like) {
      setLike(false);
      setLikeLegth(likeLegth - 1);
      const removeIndex = listLike.findIndex(
        (item) => item.userID === user.uid,
      );
      listLike.splice(removeIndex, 1);
      setLikes(listLike);
      liked(listLike);
    } else {
      setLike(true);
      setLikeLegth(likeLegth + 1);
      listLike.push({userID: user.uid});
      setLikes(listLike);
      liked(listLike);
    }
  };

  return (
    <View style={styles.Container} key={item.id}>
      <View style={styles.UserInfo}>
        <Image
          style={styles.UserImg}
          source={{
            uri: userData
              ? userData.userImg || 'https://i.stack.imgur.com/l60Hf.png'
              : 'https://i.stack.imgur.com/l60Hf.png',
          }}
        />
        {/* <Image /> */}
        <View style={styles.UserInfoText}>
          <TouchableOpacity onPress={onPress}>
            <Text style={styles.UserName}>
              {userData ? userData.fname || 'Test' : 'Test'}{' '}
              {userData ? userData.lname || 'User' : 'User'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.PostTime}>
            {moment(item.postTime.toDate()).fromNow()}
          </Text>
        </View>
      </View>
      <Text style={styles.PostText}>{item.post}</Text>
      {item.postImg != null ? (
        <ProgressiveImage
          defaultImageSource={require('../assets/default-img.jpg')}
          source={{uri: item.postImg}}
          style={{width: 400, height: 250}}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.Divider} />
      )}

      <View style={styles.InteractionWrapper}>
        <TouchableOpacity
          style={[
            styles.Interaction,
            {backgroundColor: item.liked ? '#2e64e515' : 'transparent'},
          ]}
          onPress={onLike}>
          <Ionicons name={likeIcon} size={25} color={likeIconColor} />
          <Text
            style={[
              styles.InteractionText,
              {color: like ? '#2e64e5' : '#333'},
            ]}>
            {likeLegth}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.Interaction} onPress={onComment}>
          <Ionicons name="md-chatbubble-outline" size={25} />
          <Text style={styles.InteractionText}>comment</Text>
        </TouchableOpacity>
        {user.uid === item.userId ? (
          <TouchableOpacity
            onPress={() => onDelete(item.id)}
            style={styles.Interaction}>
            <Ionicons name="md-trash-bin" size={25} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    width: '100%',
    marginBottom: 20,
    borderRadius: 10,
  },
  UserInfoText: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  UserInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 15,
    width: '100%',
  },
  UserImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  UserName: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Lato-Regular',
  },
  PostTime: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    color: '#666',
  },
  PostText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 15,
  },
  Divider: {
    borderBottomColor: '#dddddd',
    borderBottomWidth: 1,
    width: '92%',
    alignSelf: 'center',
    marginTop: 15,
  },
  InteractionWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  Interaction: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 5,
    padding: 5,
  },
  InteractionText: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    fontWeight: 'bold',
    marginTop: 5,
    marginLeft: 5,
    color: '#333333',
  },
});
export default PostCard;
