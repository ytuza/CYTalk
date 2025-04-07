from django.urls import path
from .views import MessageListView, LikeMessageView, ChatRoomListCreateView, CreateMessageView

urlpatterns = [
    path('history/<str:room_name>/', MessageListView.as_view(), name='chat-history'),
    path('like/<int:message_id>/', LikeMessageView.as_view(), name='like-message'),
    path('rooms/', ChatRoomListCreateView.as_view(), name='chat-rooms'),
    path('create/', CreateMessageView.as_view(), name='chat-create'),
]
