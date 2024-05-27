from django.urls import path
from core.consumers import DefaultConsumer

websocket_urlpatterns = [
    path('wss/', DefaultConsumer.as_asgi()),
]
