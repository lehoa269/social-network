/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import ActionButton from 'react-native-action-button';
import Entypo from 'react-native-vector-icons/Entypo';
import ImagePicker from 'react-native-image-crop-picker';

import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

import {AuthContext} from '../navigation/AuthProvider';

const AddPostScreen = () => {
  const {user, logout} = useContext(AuthContext);

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      width: 1200,
      height: 780,
      cropping: true,
    }).then((image) => {
      console.log(image);
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 1200,
      height: 780,
      cropping: true,
    }).then((image) => {
      console.log(image);
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };

  const submitPost = async () => {
    if (post === null) {
      setError('Post required');
    } else {
      const imageUrl = await uploadImage();
      console.log('Image Url: ', imageUrl);
      console.log('Post: ', post);

      firestore()
        .collection('posts')
        .add({
          userId: user.uid,
          post: post,
          postImg: imageUrl,
          postTime: firestore.Timestamp.fromDate(new Date()),
          likes: [],
          comments: [],
        })
        .then(() => {
          console.log('Post Added!');
          Alert.alert(
            'Post published!',
            'Your post has been published Successfully!',
          );
          setPost(null);
        })
        .catch((error) => {
          console.log(
            'Something went wrong with added post to firestore.',
            error,
          );
        });
      setError('');
    }
  };

  const uploadImage = async () => {
    if (image == null) {
      return null;
    }
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;

    setUploading(true);
    setTransferred(0);

    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

      setTransferred(
        Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
          100,
      );
    });

    try {
      await task;

      const url = await storageRef.getDownloadURL();

      setUploading(false);
      setImage(null);

      return url;
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  const chooseMethodAddImage = () => {
    Alert.alert('ADD IMAGE', 'Choose Method', [
      {
        text: 'Take Photo',
        onPress: takePhotoFromCamera,
      },
      {text: 'Choose Photo', onPress: choosePhotoFromLibrary},
    ]);
  };
  return (
    <View style={styles.container}>
      {image != null ? (
        <Image
          style={{width: '100%', height: 250, marginBottom: 15}}
          source={{uri: image}}
        />
      ) : null}
      <View style={styles.viewTextInput}>
        <TextInput
          placeholder="What's on your mind?"
          multiline
          numberOfLines={4}
          value={post}
          onChangeText={(content) => setPost(content)}
        />
      </View>

      {uploading ? (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text>{transferred} % Completed!</Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <TouchableOpacity style={styles.buttonPost} onPress={submitPost}>
          <Text style={{color: 'white', marginLeft: 10, fontWeight: 'bold'}}>
            POST
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => chooseMethodAddImage()}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#4F8EF7',
            width: 130,
            height: 40,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 250,
            marginTop: 30,
          }}>
          <Entypo name="images" size={30} color="white" />
          <Text style={{color: 'white', marginLeft: 10, fontWeight: 'bold'}}>
            Add Image
          </Text>
        </View>
      </TouchableOpacity>
      <Text style={{color: 'red', margin: 25}}>{error}</Text>
    </View>
  );
};

export default AddPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  viewTextInput: {
    backgroundColor: 'white',
    width: '100%',
    height: '20%',
    alignItems: 'center',
  },
  buttonPost: {
    backgroundColor: '#2e64e5',
    width: '90%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    margin: 20,
  },
});
