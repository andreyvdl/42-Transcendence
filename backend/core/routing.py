from django.urls import path
from core.consumers import LoginConsumer, RegisterConsumer

websocket_urlpatterns = [
    path('wss/login/', LoginConsumer.as_asgi()),
    path('wss/register/', RegisterConsumer.as_asgi()),
]
