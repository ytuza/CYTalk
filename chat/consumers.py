import json
import os

import firebase_admin
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from firebase_admin import credentials, initialize_app, messaging

from .models import ChatRoom, Message

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Se ejecuta cuando un cliente se conecta"""
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Crear la sala si no existe
        await self.get_or_create_room(self.room_name)

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        """Se ejecuta cuando un cliente se desconecta"""
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """Recibe mensajes de WebSocket y los guarda en la BD"""
        try:
            data = json.loads(text_data)
            message = data.get("message", None)
            username = data.get("username", None)

            if not message or not username:
                await self.send(
                    text_data=json.dumps({"error": "Mensaje o usuario no válido"})
                )
                return

            user = await self.get_user(username)
            room = await self.get_room(self.room_name)

            # Guardar mensaje en la base de datos
            await self.save_message(user, room, message)

            # Enviar notificación push
            await self.send_push_notification(room, user, message)

            # Enviar mensaje a los clientes en el grupo
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "chat_message", "message": message, "username": username},
            )

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Formato JSON inválido"}))

    async def chat_message(self, event):
        """Enviar mensaje a WebSockets"""
        await self.send(
            text_data=json.dumps(
                {"message": event["message"], "username": event["username"]}
            )
        )

    @sync_to_async
    def get_user(self, username):
        """Obtener el usuario desde la base de datos"""
        return User.objects.get(username=username)

    @sync_to_async
    def get_or_create_room(self, room_name):
        """Obtener o crear una sala de chat"""
        return ChatRoom.objects.get_or_create(name=room_name)

    @sync_to_async
    def get_room(self, room_name):
        """Obtener una sala existente"""
        return ChatRoom.objects.get(name=room_name)

    @sync_to_async
    def save_message(self, user, room, content):
        """Guardar mensaje en la base de datos"""
        Message.objects.create(user=user, room=room, content=content)

    @sync_to_async
    def send_push_notification(self, room, sender, message):
        if not firebase_admin._apps:
            cred_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "cytalk-firebase-adminsdk-fbsvc-ad779da798.json",
            )
            cred = credentials.Certificate(cred_path)
            initialize_app(cred)

        users = User.objects.filter(fcm_token__isnull=False).exclude(id=sender.id)
        tokens = [user.fcm_token for user in users]

        for token in tokens:
            try:
                messaging.send(
                    messaging.Message(
                        notification=messaging.Notification(
                            title=f"Nuevo mensaje en {room.name}",
                            body=f"{sender.username}: {message}",
                        ),
                        token=token,
                    )
                )
            except Exception as e:
                print(f"Error enviando notificación a {token}: {e}")
