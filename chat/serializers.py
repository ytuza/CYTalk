from rest_framework import serializers

from .models import ChatRoom, Message


class MessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    profile_image = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "username",
            "room",
            "content",
            "timestamp",
            "like_count",
            "profile_image",
            "is_liked",
            "image",
        ]

    def get_profile_image(self, obj):
        request = self.context.get("request")
        if obj.user.profile_image and request:
            return request.build_absolute_uri(obj.user.profile_image.url)
        elif obj.user.profile_image:
            return obj.user.profile_image.url
        return None

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return request.user in obj.likes.all()
        return False


class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ["id", "name"]
