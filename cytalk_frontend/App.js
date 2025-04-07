import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import AuthLoadingScreen from './src/screens/AuthLoadingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RoomListScreen from './src/screens/RoomListScreen';
import * as Notifications from 'expo-notifications';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📥 Notificación recibida:', notification);
    });
  
    return () => subscription.remove();
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Perfil' }} />
          <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Sala de chat' }} />
          <Stack.Screen name="RoomList" component={RoomListScreen} options={{ headerShown: true, title: 'Salas de chat' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

Notifications.scheduleNotificationAsync({
  content: {
    title: "Notificación local",
    body: "Esto es solo una prueba",
  },
  trigger: null,
});