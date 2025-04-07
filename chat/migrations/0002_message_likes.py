# Generated by Django 5.1.6 on 2025-03-07 18:02

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="message",
            name="likes",
            field=models.ManyToManyField(
                blank=True, related_name="liked_messages", to=settings.AUTH_USER_MODEL
            ),
        ),
    ]
