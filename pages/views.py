from django.http import HttpResponse
from django.views import View
from django.shortcuts import render
from django.contrib.auth.models import User

class RegisterView(View):
    def get(self, request):
        return render(request, "register.html")

    def post(self, request):
        username = request.POST["username"].strip()
        password = request.POST["password"].strip()

        if len(username) < 1 or len(password) < 1:
            ctx = {
                    'error': True,
                    'username': username,
                    'password': password,
                    'err_msg': "Invalid username or password."
            }
            return render(request, "register.html", ctx)

        if User.objects.filter(username = username).exists():
            ctx = {
                    'error': True,
                    'username': username,
                    'password': password,
                    'err_msg': "This username already exists, try a new one."
            }
            return render(request, "register.html", ctx)

        pong_user = User.objects.create_user(
            username,
            password = password
        )
        pong_user.save()
        return HttpResponse(201)
