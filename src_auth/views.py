from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils.datastructures import MultiValueDictKeyError
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from main.models import PongUser


def _ajax(request):
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"


class RegisterView(View):
    @staticmethod
    def get(request):
        if not _ajax(request):
            return render(request, 'base.html')
        if request.user.is_authenticated:
            return JsonResponse({'redirect': reverse('account')}, status=302)
        inner_html = render_to_string('pages/register.html', request=request)
        return JsonResponse({'innerHtml': inner_html})

    @staticmethod
    def post(request):
        email = request.POST["email"]
        username = request.POST["username"]
        password = request.POST["password1"]
        comp = request.POST["password2"]

        if password != comp:
            ctx = {
                'registered_successfully': False,
                'error': True,
                'err_msg': "Passwords don't match",
            }
            inner_html = render_to_string('pages/register.html', ctx, request=request)
            return JsonResponse({'innerHtml': inner_html})

        try:
            file = request.FILES["file"]
        except MultiValueDictKeyError:
            file = None

        try:
            pong_user = PongUser.objects.create_user(
                email=email,
                username=username,
                password=password,
                profile_picture=file
            )
            pong_user.save()
        except:
            ctx = {
                'registered_successfully': False,
                'error': True,
                'err_msg': "Email already in use",
            }
            inner_html = render_to_string('pages/register.html', ctx, request=request)
            return JsonResponse({'innerHtml': inner_html})

        ctx = {
            'registered_successfully': True,
            'username': username
        }
        inner_html = render_to_string('pages/register.html', ctx, request=request)
        return JsonResponse({'innerHtml': inner_html})


class LoginView(View):
    @staticmethod
    def get(request):
        if not _ajax(request):
            return render(request, 'base.html')
        if request.user.is_authenticated:
            return JsonResponse({'redirect': reverse('account')}, status=302)
        return JsonResponse({'innerHtml': render_to_string('pages/login.html', request=request)})

    @staticmethod
    def post(request):
        username = request.POST["username"].strip()
        password = request.POST["password"].strip()

        user = authenticate(
            request,
            username=username,
            password=password
        )
        if user is not None:
            login(request, user)
            return JsonResponse({'redirect': reverse('account')}, status=302)
        ctx = {'err': True, 'err_msg': "Invalid username or password"}
        inner_html = render_to_string('pages/login.html', ctx, request=request)
        return JsonResponse({'innerHtml': inner_html})


@csrf_exempt
@login_required(login_url='login')
def logout_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Expected POST'}, status=400)
    request.user.online = False
    request.user.save()
    logout(request)
    return JsonResponse({'redirect': reverse('login')}, status=302)
