from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

class RegisterUserView(generics.CreateAPIView):
    """Vista para registrar nuevos usuarios"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserProfileUpdateView(generics.RetrieveUpdateAPIView):
    """Permite a los usuarios ver y actualizar su perfil"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UpdateFCMTokenView(APIView):
    """Permite a los usuarios actualizar su token de Firebase"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        fcm_token = request.data.get('fcm_token')

        if not fcm_token:
            return Response({"error": "Falta el token de FCM"}, status=400)

        user.fcm_token = fcm_token
        user.save()

        return Response({"message": "Token actualizado correctamente"})