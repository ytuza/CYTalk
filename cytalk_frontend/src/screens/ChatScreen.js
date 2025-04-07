import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import axios from '../api/axiosInstance';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';

export default function ChatScreen({ route }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const ws = useRef(null);
  const flatListRef = useRef(null);
  const { roomName = 'testroom', username = 'anonimo' } = route.params || {};
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageToShow, setImageToShow] = useState(null);

  useEffect(() => {
    fetchMessages();
    connectWebSocket();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const openImage = (uri) => {
    setImageToShow(uri);
    setModalVisible(true);
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`chat/history/${roomName}/`);
      setMessages(res.data);
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
    }
  };

  const connectWebSocket = () => {
    ws.current = new WebSocket(`ws://192.168.1.20:8000/ws/chat/${roomName}/`);

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const formatted = {
        username: data.username,
        content: data.message || data.content,
      };
      setMessages((prev) => [...prev, formatted]);
    };

    ws.current.onerror = (e) => console.error('WebSocket error:', e.message);
    ws.current.onclose = () => console.log('WebSocket cerrado');
  };

  const sendMessage = () => {
    if (ws.current && messageText.trim()) {
      ws.current.send(JSON.stringify({ username, message: messageText }));
      setMessageText('');
    }
  };

  const handleLike = async (messageId) => {
    console.log('🔍 Dando like al mensaje:', messageId);
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const res = await axios.post(
        `chat/like/${messageId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // actualizar like_count localmente
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                like_count: res.data.like_count,
                is_liked: !msg.is_liked,
              }
            : msg
        )
      );
    } catch (err) {
      console.error('❌ Error al dar like:', err);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const sendImageMessage = async () => {
    if (!selectedImage) return;
    const token = await AsyncStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('room', 1);
    formData.append('content', messageText);
    formData.append('image', {
      uri: selectedImage.uri,
      type: 'image/jpeg',
      name: 'chat_image.jpg',
    });

    try {
      const res = await axios.post('chat/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages((prev) => [...prev, res.data]);
      setSelectedImage(null);
      setMessageText('');
    } catch (err) {
      console.error('❌ Error al enviar imagen:', err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => `${index}`}
            renderItem={({ item }) => {
              const isOwnMessage = item.username === username;
              return (
                <View
                  style={[
                    styles.messageRow,
                    isOwnMessage ? styles.myMessageRow : styles.otherMessageRow,
                  ]}
                >
                  {item.profile_image && (
                    <ExpoImage
                      source={{ uri: item.profile_image }}
                      style={styles.avatar}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isOwnMessage ? styles.myBubble : styles.otherBubble,
                    ]}
                  >
                    {!isOwnMessage && (
                      <Text style={styles.user}>{item.username}</Text>
                    )}

                    {/* Texto del mensaje */}
                    {item.content ? <Text>{item.content}</Text> : null}

                    {/* Imagen si existe */}
                    {item.image && (
                      <TouchableOpacity onPress={() => openImage(item.image)}>
                        <ExpoImage
                          source={{ uri: item.image }}
                          style={styles.chatImage}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                        />
                      </TouchableOpacity>
                    )}
                    <View style={styles.likeRow}>
                      <TouchableOpacity onPress={() => handleLike(item.id)}>
                        <AntDesign
                          name={item.is_liked ? 'heart' : 'hearto'}
                          size={16}
                          color={item.is_liked ? 'red' : 'gray'}
                        />
                      </TouchableOpacity>
                      <Text style={styles.likeCount}> {item.like_count}</Text>
                    </View>
                  </View>
                  <Modal
                    isVisible={modalVisible}
                    onBackdropPress={() => setModalVisible(false)}
                  >
                    <View style={styles.modalContainer}>
                      {imageToShow && (
                        <ExpoImage
                          source={{ uri: imageToShow }}
                          style={styles.fullscreenImage}
                          contentFit="contain"
                          cachePolicy="memory-disk"
                        />
                      )}
                    </View>
                  </Modal>
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Escribe un mensaje..."
            />
            <Button
              title="Enviar"
              onPress={selectedImage ? sendImageMessage : sendMessage}
            />
            <Button title="📷" onPress={pickImage} />
          </View>
          {selectedImage && (
            <View style={styles.imagePreview}>
              <ExpoImage
                source={{ uri: selectedImage.uri }}
                style={styles.image}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  msg: { fontSize: 16, paddingVertical: 4 },
  user: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  chatImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    maxHeight: '50%',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  bubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    maxWidth: '80%',
  },
  user: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 12,
    color: 'gray',
  },
  myMessageRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
  },
  otherMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bubble: {
    padding: 10,
    borderRadius: 8,
    maxWidth: '75%',
  },
  myBubble: {
    backgroundColor: '#d0ebff',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  imagePreview: {
    marginTop: 10,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
});
