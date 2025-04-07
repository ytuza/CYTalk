import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import axios from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function registerForPushNotificationsAsync() {
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('❌ No se otorgaron permisos de notificación.');
    return;
  }

  if (Device.isDevice) {
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('FCM Token:', token);

    // Guardar localmente (opcional)
    await AsyncStorage.setItem('fcm_token', token);

    // Enviar al backend
    try {
      await axios.post('auth/update_fcm_token/', { fcm_token: token });
      console.log('✅ Token FCM registrado en el backend');
    } catch (error) {
      console.error('❌ Error al registrar token FCM:', error);
    }
  } else {
    alert('Debe usar un dispositivo físico para recibir notificaciones');
  }
}
