import sys
from channels.generic.websocket import JsonWebsocketConsumer
from django.template.loader import render_to_string

class ConsumerPage(JsonWebsocketConsumer):
    def connect(self):
        print("NEW CONNECT CONSUMER PAGE")
        sys.stdout.flush()
        self.accept()
    
    def disconnect(self, code):
        print("DISCONNECT CONSUMER PAGE WITH CODE: ", code)
        sys.stdout.flush()

    def receive_json(self, content):
        page = content['type']

        match page:
            case "home":
                html_str = render_to_string("home.html")
            case "login":
                html_str = render_to_string("login.html")
            case "register":
                html_str = render_to_string("register.html")
            case _:
                html_str = ""

        self.send(html_str)

