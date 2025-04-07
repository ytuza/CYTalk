from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """Modelo de usuario personalizado"""
    profile_image = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    fcm_token = models.CharField(max_length=255, blank=True, null=True)  # Token de Firebase

    def __str__(self):
        return self.username
