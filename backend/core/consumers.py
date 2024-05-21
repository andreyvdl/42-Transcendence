import json
import sys
from channels.generic.websocket import JsonWebsocketConsumer

class LoginConsumer(JsonWebsocketConsumer):
    def connect(self):
        print("NEW CONNECT")
        sys.stdout.flush() # FOR DEGUB WITH CONTAINERS LOGS
        self.accept()

    def receive_json(self, content):
        email = content.get('email')
        password = content.get('password')
        print("email: ", email)
        print("password: ", password)
        self.send_json({'message': 'Understandable, Have A Great Day'})

    def disconnect(self, close_code):
        print("DISCONNECT WITH CODE: ", close_code)
        pass

class RegisterConsumer(JsonWebsocketConsumer):
    def connect(self):
        print("NEW CONNECT")
        sys.stdout.flush() # FOR DEGUB WITH CONTAINERS LOGS
        self.accept()

    def receive_json(self, content):
        email = content.get('email')
        password = content.get('password')
        print("email: ", email)
        print("password: ", password)
        self.send_json({'message': 'received'})

    def disconnect(self, close_code):
        print("DISCONNECT WITH CODE: ", close_code)
        pass

