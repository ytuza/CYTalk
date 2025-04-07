import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

export default function AuthLoadingScreen({ navigation }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const username = await AsyncStorage.getItem('username');

      if (token && username) {
        dispatch(setCredentials({ user: username, accessToken: token }));
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    };

    checkLogin();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
