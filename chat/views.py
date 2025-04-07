from rest_framework import generics, status
from .models import Message, ChatRoom
from .serializers import MessageSerializer, ChatRoomSerializer
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.http import QueryDict

class MessageListView(generics.ListAPIView):
    """Devuelve el historial de mensajes de una sala"""
    serializer_class = MessageSerializer

    def get_queryset(self):
        room_name = self.kwargs['room_name']
        return Message.objects.filter(room__name=room_name).order_by('timestamp')

class LikeMessageView(APIView):
    """Permite a los usuarios dar o quitar 'Me gusta' a un mensaje"""

    def post(self, request, message_id):
        message = get_object_or_404(Message, id=message_id)
        user = request.user

        if user in message.likes.all():
            message.likes.remove(user)
            liked = False
        else:
            message.likes.add(user)
            liked = True

        return Response({"liked": liked, "like_count": message.like_count()}, status=status.HTTP_200_OK)
    
class ChatRoomListCreateView(ListCreateAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class CreateMessageView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        data = request.data.dict() if isinstance(request.data, QueryDict) else dict(request.data)
        data['user'] = request.user.id
        print(data)
        if 'content' not in data or data['content'] == '':
            data['content'] = 'Imagen'
        serializer = MessageSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            message = serializer.save(user=request.user) 
            # message = serializer.save()
            # Solo si el campo `image` está declarado como editable en el serializer/model
            if 'image' in request.FILES:
                message.image = request.FILES['image']
                message.save()

            return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)