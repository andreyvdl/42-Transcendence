from django.urls import path
from core.consumers import DefaultConsumer
from pages.consumers import ConsumerPage

websocket_urlpatterns = [
    path('wss/', DefaultConsumer.as_asgi()),
    path('wss/page', ConsumerPage.as_asgi()),
]
