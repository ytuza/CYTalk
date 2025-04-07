from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional', {'fields': ('profile_image', 'bio')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
