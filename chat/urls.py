from django.urls import path

from .views import (
    ChatRoomListCreateView,
    CreateMessageView,
    LikeMessageView,
    MessageListView,
)

urlpatterns = [
    path("history/<str:room_name>/", MessageListView.as_view(), name="chat-history"),
    path("like/<int:message_id>/", LikeMessageView.as_view(), name="like-message"),
    path("rooms/", ChatRoomListCreateView.as_view(), name="chat-rooms"),
    path("create/", CreateMessageView.as_view(), name="chat-create"),
]
