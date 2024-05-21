import os
from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from core.custom_consumer import CustomConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter([
        path('ws', CustomConsumer.as_asgi()),
    ]),
})
