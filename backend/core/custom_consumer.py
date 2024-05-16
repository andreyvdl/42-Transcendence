import json
from channels.generic.websocket import WebsocketConsumer

class CustomConsumer(WebsocketConsumer):
    def connect(self):
        print("New connect")
        self.accept()

    def disconnect(self, close_code):
        print("Disconnect with code ", close_code);

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print("Receive message: ", text_data_json)
