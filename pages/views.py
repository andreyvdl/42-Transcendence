from django.http import HttpResponse
from django.views import View
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import PongUser

class AccountView(View):
    def get(self, request):
        ctx = {
            'username': request.user.username,
            'wins': request.user.get_wins(),
            'losses': request.user.get_losses(),
            'avatar': request.user.get_avatar()
        }
        return render(request, "account.html", ctx)

    def post(self, request):
        new_username = request.POST['new_username'].strip()
        if PongUser.objects.filter(username = new_username).exists():
            ctx = {
                'username': request.user.username,
                'wins': request.user.get_wins(),
                'losses': request.user.get_losses(),
                'avatar': request.user.get_avatar(),
                'hide_form': True,
                'msg': '🔴 User already exists.'
            }
            return render(request, "account.html", ctx)
        else:
            curr_user = PongUser.objects.get(username = request.user)
            curr_user.username = new_username
            curr_user.save()
            ctx = {
                'username': curr_user.username,
                'wins': curr_user.get_wins(),
                'losses': curr_user.get_losses(),
                'avatar': curr_user.get_avatar(),
                'hide_form': True,
                'msg': '🟢 Username changed successfully.'
            }
            return render(request, "account.html", ctx)

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
        if user is not None:
            login(request, user)
            return redirect('account')
        ctx = {'err': True, 'err_msg': "Invalid username or password"}
        return render(request, "login.html", ctx)


class RegisterView(View):
    def get(self, request):
        return render(request, "register.html")

    def post(self, request):
        username = request.POST["username"]
        password = request.POST["password1"]
        # form = UserCreationForm(request.POST)

        # https://docs.djangoproject.com/en/5.0/topics/auth/default/#django.contrib.auth.forms.BaseUserCreationForm
        # if not form.is_valid():
        #     ctx = {
        #         'error': True,
        #         'err_msg': form.errors,
        #         'username': username,
        #         'password': password
        #     }
        #     return render(request, "register.html", ctx)

        pong_user = PongUser.objects.create_user(
            username,
            password = password
        )
        pong_user.save()
        ctx = {
            'registered_successfully': True,
            'username': username
        }
        return render(request, "register.html", ctx)

