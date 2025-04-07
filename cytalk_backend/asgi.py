import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing  # Importar las rutas WebSocket (se creará después)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cytalk_backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Manejar peticiones HTTP normales
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns  # Rutas WebSocket
        )
    ),
})
