from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import RegisterUserView, UpdateFCMTokenView, UserProfileUpdateView

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegisterUserView.as_view(), name="register"),
    path("profile/", UserProfileUpdateView.as_view(), name="profile"),
    path("update_fcm_token/", UpdateFCMTokenView.as_view(), name="update_fcm_token"),
]
