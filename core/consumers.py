import sys
from channels.generic.websocket import JsonWebsocketConsumer

class DefaultConsumer(JsonWebsocketConsumer):
    def connect(self):
        print("NEW CONNECT")
        sys.stdout.flush()
        self.accept()

    def receive_json(self, content):
        email = content.get('email')   
        password = content.get('password')
        print("email: ", email)
        print("password: ", password)
        sys.stdout.flush()
        self.send_json({'message': 'Understandable, have a great day'})

    def disconnect(self, code):
        print("DISCONNECT WITH CODE: ", code)
        sys.stdout.flush()
