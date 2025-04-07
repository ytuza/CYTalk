from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatRoom(models.Model):
    """Sala de chat donde se agrupan los mensajes"""
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Message(models.Model):
    """Modelo para almacenar mensajes en la base de datos"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    content = models.TextField()
    image = models.ImageField(upload_to='chat_images/', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name="liked_messages", blank=True)

    def like_count(self):
        """Retorna la cantidad de 'Me gusta' en el mensaje"""
        return self.likes.count()

    def __str__(self):
        return f"{self.user.username}: {self.content[:30]}"
