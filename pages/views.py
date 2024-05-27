from django.http import HttpResponse
from django.views import View
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class LoginView(View):
    def get(self, request):
        return render(request, "login.html")

    def post(self, request):
        username = request.POST["username"].strip()
        password = request.POST["password"].strip()

        user = authenticate(
            request,
            username = username,
            password = password
        )
        print(user)
        if user is not None:
            login(request, user)
            print(user)

        return HttpResponse(200)


class RegisterView(View):
    def get(self, request):
        return render(request, "register.html")

    def post(self, request):
        username = request.POST["username"]
        password = request.POST["password1"]
        form = UserCreationForm(request.POST)

        # https://docs.djangoproject.com/en/5.0/topics/auth/default/#django.contrib.auth.forms.BaseUserCreationForm
        if not form.is_valid():
            ctx = {
                'error': True,
                'err_msg': form.errors,
                'username': username,
                'password': password1
            }
            return render(request, "register.html", ctx)

        pong_user = User.objects.create_user(
            username,
            password = password
        )
        pong_user.save()
        ctx = {
            'registered_successfully': True,
            'username': username
        }
        return render(request, "register.html", ctx)

